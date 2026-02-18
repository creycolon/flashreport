# Sistema de Autenticación y Gestión de Roles - Plan de Implementación

## 📅 Fecha de Creación
Febrero 2026

## 🎯 Propósito
Implementar un sistema completo de autenticación utilizando **Supabase Auth** integrado con la tabla existente de `partners`, agregando roles granularizados y una pantalla de login antes del acceso a la aplicación.

## 🏗️ Arquitectura General

### **Visión del Sistema**
```
┌─────────────────────────────────────────────────────────┐
│                     Supabase Auth                       │
│               (auth.users, auth.sessions)               │
└───────────────┬─────────────────────────────────────────┘
                │
┌───────────────▼─────────────────────────────────────────┐
│                Sistema Flash Report                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │  system_users (vincular auth.id → partner.id)   │   │
│  │  user_permissions (roles granularizados)        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │  partners (ampliada con email, phone, etc.)    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │  UI Context: AuthContext + Permission checks    │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### **Roles Definidos**
1. **BASE**: Usuario recién registrado, pendiente de activación (solo lectura limitada)
2. **DATA_ENTRY**: Solo puede crear movimientos de caja (empleado de data entry)
3. **PARTNER**: Socio regular con acceso completo a sus operaciones
4. **MANAGING_PARTNER**: Socio gerente existente + gestión de usuarios
5. **ADMIN**: Superusuario (backup/emergencia)

## 📊 Cambios en Esquema de Base de Datos

### **1. Tablas Nuevas**

#### **`system_users`** - Vinculación auth ↔ partners
```sql
-- Ejecutar en Supabase SQL Editor
CREATE TABLE system_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    partner_id TEXT REFERENCES partners(id) ON DELETE CASCADE,
    user_role TEXT NOT NULL CHECK (user_role IN ('BASE', 'DATA_ENTRY', 'PARTNER', 'MANAGING_PARTNER', 'ADMIN')),
    is_active BOOLEAN DEFAULT true,
    requires_activation BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_auth_user UNIQUE(auth_user_id),
    CONSTRAINT fk_partner_user UNIQUE(partner_id)
);

-- Índices para performance
CREATE INDEX idx_system_users_auth_id ON system_users(auth_user_id);
CREATE INDEX idx_system_users_partner_id ON system_users(partner_id);
CREATE INDEX idx_system_users_role_active ON system_users(user_role, is_active);
```

#### **`user_permissions`** - Permisos granularizados por rol
```sql
CREATE TABLE user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_role TEXT NOT NULL,
    permission_key TEXT NOT NULL,
    permission_value BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_role_permission UNIQUE(user_role, permission_key)
);

-- Insertar permisos por defecto (ver script completo en sección anexos)
```

### **2. Modificaciones a Tablas Existentes**

#### **`partners`** - Ampliar con datos de contacto
```sql
ALTER TABLE partners ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS contact_name TEXT;
```

### **3. Habilitar RLS (Row Level Security)**
```sql
-- Habilitar RLS en tablas sensibles
ALTER TABLE system_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajustar según necesidades)
CREATE POLICY "Users can view own profile" ON system_users
    FOR SELECT USING (
        auth_user_id = auth.uid() 
        OR user_role IN ('MANAGING_PARTNER', 'ADMIN')
    );

CREATE POLICY "Managing partners can manage users" ON system_users
    FOR ALL USING (user_role IN ('MANAGING_PARTNER', 'ADMIN'));

CREATE POLICY "All authenticated users can view permissions" ON user_permissions
    FOR SELECT USING (auth.role() = 'authenticated');
```

## 🔐 Flujos de Autenticación

### **Flujo de Registro (Primer Acceso)**
```
1. Usuario ingresa a app → Pantalla de Login
2. Selecciona "¿Primer acceso? Registrarse"
3. Completa formulario:
   - Email (validar formato)
   - Password (mínimo 8 caracteres)
   - Confirmar password
   - Socio (dropdown de partners activos sin usuario)
4. Sistema verifica:
   - Email no registrado en auth.users
   - Socio no tiene usuario asociado
   - Email coincide con socio (opcional/configurable)
5. Se crea:
   - Usuario en auth.users (Supabase Auth)
   - Registro en system_users con rol BASE, requires_activation=true
   - Email de confirmación (si configurado)
6. Usuario ve pantalla "Pendiente de Activación"
```

### **Flujo de Login**
```
1. Usuario ingresa email y password
2. Sistema autentica con Supabase Auth
3. Si éxito, obtiene:
   - Session token
   - User profile de system_users
   - Permisos asociados al rol
4. Si requires_activation=true → Pantalla de espera
5. Si activo → Navegación principal según rol
```

### **Flujo de Activación por Socio Gerente**
```
1. Socio gerente accede a "Gestión de Usuarios"
2. Ve lista de usuarios con requires_activation=true
3. Para cada usuario ve:
   - Email
   - Socio asociado
   - Fecha de registro
4. Puede:
   - Asignar rol: DATA_ENTRY, PARTNER, MANAGING_PARTNER
   - Rechazar registro (eliminar usuario)
   - Enviar mensaje al usuario
5. Al activar:
   - requires_activation = false
   - is_active = true
   - Notificación al usuario
```

## 🛠️ Componentes a Desarrollar

### **1. Servicios y Repositorios**

#### **`authService.ts`** - Servicio de autenticación
```typescript
// src/infrastructure/auth/authService.ts
interface AuthService {
  // Autenticación básica
  login(email: string, password: string, partnerId: string): Promise<AuthResult>
  register(email: string, password: string, partnerId: string): Promise<AuthResult>
  logout(): Promise<void>
  getCurrentSession(): Promise<Session | null>
  
  // Gestión de usuario
  getCurrentUserProfile(): Promise<UserProfile | null>
  updateUserProfile(data: Partial<UserProfile>): Promise<boolean>
  requestPasswordReset(email: string): Promise<boolean>
  
  // Verificación de estado
  checkActivationStatus(): Promise<ActivationStatus>
  resendActivationEmail(): Promise<boolean>
}

// Tipos relacionados
interface UserProfile {
  id: string
  authUserId: string
  partnerId: string
  partnerName: string
  userRole: UserRole
  isActive: boolean
  requiresActivation: boolean
  email: string
  createdAt: Date
  permissions: Permission[]
}

type UserRole = 'BASE' | 'DATA_ENTRY' | 'PARTNER' | 'MANAGING_PARTNER' | 'ADMIN'
```

#### **`userRoleService.ts`** - Gestión de roles y permisos
```typescript
// src/application/services/userRoleService.ts
interface UserRoleService {
  // Consultas
  getAvailablePartnersForRegistration(): Promise<Partner[]>
  getUserPermissions(userId: string): Promise<Permission[]>
  getPendingActivations(): Promise<PendingUser[]>
  getAllUsers(): Promise<SystemUser[]>
  
  // Operaciones (solo managing partner/admin)
  assignUserRole(userId: string, newRole: UserRole): Promise<boolean>
  activateUser(userId: string): Promise<boolean>
  deactivateUser(userId: string): Promise<boolean>
  updateUserPermissions(role: UserRole, permissions: PermissionUpdate[]): Promise<boolean>
  
  // Verificaciones
  hasPermission(userId: string, permissionKey: string): Promise<boolean>
  canManageUsers(userId: string): Promise<boolean>
}

interface PendingUser {
  id: string
  email: string
  partnerId: string
  partnerName: string
  registeredAt: Date
  userRole: UserRole
}
```

#### **`userRepository.ts`** - Repositorio para system_users
```typescript
// src/infrastructure/repositories/userRepository.ts
interface UserRepository {
  // CRUD básico
  create(userData: CreateUserData): Promise<SystemUser>
  findById(userId: string): Promise<SystemUser | null>
  findByAuthId(authUserId: string): Promise<SystemUser | null>
  findByPartnerId(partnerId: string): Promise<SystemUser | null>
  update(userId: string, updates: Partial<SystemUser>): Promise<boolean>
  
  // Consultas específicas
  findPendingActivations(): Promise<SystemUser[]>
  findByRole(role: UserRole): Promise<SystemUser[]>
  findActiveUsers(): Promise<SystemUser[]>
  
  // Verificaciones
  isPartnerAvailable(partnerId: string): Promise<boolean>
  emailExists(email: string): Promise<boolean>
}
```

### **2. Pantallas de UI**

#### **`LoginScreen.tsx`** - Autenticación y registro
```typescript
// Componentes principales:
// - LoginForm (email, password, recordar sesión)
// - RegisterForm (email, password, confirmar, dropdown partners)
// - ForgotPasswordLink
// - Social login options (opcional futuro)
// - Toggle entre login/registro
```

#### **`PendingActivationScreen.tsx`** - Espera de activación
```typescript
// Mensaje amigable: "Tu cuenta está pendiente de activación"
// Detalles: socio asociado, fecha de registro
// Opción: "Contactar al socio gerente"
// Opción: "Cerrar sesión"
```

#### **`UserActivationScreen.tsx`** - Gestión de activaciones (socio gerente)
```typescript
// Lista de usuarios pendientes con:
// - Email, socio, fecha
// - Botones: Activar como DATA_ENTRY/PARTNER, Rechazar
// - Filtros: por socio, fecha
// - Buscador por email o nombre de socio
```

#### **`UserProfileScreen.tsx`** - Perfil de usuario
```typescript
// Información del usuario actual
// Cambio de contraseña
// Datos de contacto (si socio gerente puede editar)
// Historial de sesiones (opcional)
// Botón cerrar sesión
```

#### **`RoleManagementScreen.tsx`** - Gestión de usuarios (socio gerente)
```typescript
// Lista completa de usuarios
// Filtros por rol, estado activo
// Edición en línea de roles
// Activación/desactivación
// Exportar lista (CSV)
```

### **3. Componentes de Navegación y Contexto**

#### **`AuthNavigator.tsx`** - Router condicional
```typescript
// Lógica:
// 1. Verificar loading → LoadingScreen
// 2. Si no hay sesión → LoginScreen
// 3. Si sesión pero pending activation → PendingActivationScreen
// 4. Si sesión activa → MainAppTabs (según rol)
```

#### **`AuthContext.tsx`** - Contexto global de autenticación
```typescript
interface AuthContextType {
  // Estado
  user: UserProfile | null
  session: Session | null
  permissions: Permission[]
  isLoading: boolean
  isAuthenticated: boolean
  
  // Acciones
  login: (email: string, password: string, partnerId?: string) => Promise<LoginResult>
  register: (email: string, password: string, partnerId: string) => Promise<RegisterResult>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  
  // Utilidades
  hasPermission: (permissionKey: string) => boolean
  canAccess: (route: string) => boolean
  getUserRole: () => UserRole | null
}
```

#### **`ProtectedRoute.tsx`** - Wrapper para rutas protegidas
```typescript
// Props: requiredPermissions, requiredRole, fallbackComponent
// Verifica permisos antes de renderizar children
// Redirige a Login o Unauthorized según corresponda
```

#### **`RoleBasedTabBar.tsx`** - Tabs dinámicos según rol
```typescript
// Configuración de tabs por rol:
const TAB_CONFIG = {
  BASE: [
    { name: 'dashboard', label: 'Resumen', icon: 'stats-chart' }
  ],
  DATA_ENTRY: [
    { name: 'movements', label: 'Movimientos', icon: 'list' },
    { name: 'add', label: 'Agregar', icon: 'add-circle' }
  ],
  PARTNER: [
    { name: 'dashboard', label: 'Resumen', icon: 'stats-chart' },
    { name: 'movements', label: 'Historial', icon: 'list' },
    { name: 'add', label: 'Agregar', icon: 'add-circle' },
    { name: 'reports', label: 'Reportes', icon: 'document-text' },
    { name: 'settings', label: 'Ajustes', icon: 'settings-outline' }
  ],
  MANAGING_PARTNER: [
    { name: 'dashboard', label: 'Resumen', icon: 'stats-chart' },
    { name: 'movements', label: 'Historial', icon: 'list' },
    { name: 'add', label: 'Agregar', icon: 'add-circle' },
    { name: 'reports', label: 'Reportes', icon: 'document-text' },
    { name: 'users', label: 'Usuarios', icon: 'people' },
    { name: 'settings', label: 'Ajustes', icon: 'settings-outline' }
  ]
}
```

## 🚀 Fases de Implementación

### **Fase 1: Preparación del Esquema (1-2 días)**

**Objetivo**: Crear tablas en Supabase y preparar migración.

**Prompts específicos**:
```
1. "Crear migración SQL para sistema de autenticación que incluya:
   - Tabla system_users con relación a auth.users y partners
   - Tabla user_permissions con permisos por defecto
   - Campos adicionales en tabla partners (email, phone)
   - Índices para performance
   - Políticas RLS básicas"

2. "Ejecutar migración en Supabase SQL Editor y verificar creación de tablas"

3. "Crear script para migrar usuarios existentes (p1, p2) a system_users:
   - Asignar p1 como MANAGING_PARTNER con email dummy
   - Asignar p2 como PARTNER con email dummy
   - Generar auth.users para cada uno (usar Supabase Admin API)"
```

**Archivos a crear/modificar**:
- `supabase/migrations/2025021901_auth_system.sql`
- `scripts/migrate_existing_users.js`
- Actualizar `master-plan.md` con estado de migración

### **Fase 2: Servicios de Autenticación (2-3 días)**

**Objetivo**: Implementar servicios core para auth y gestión de usuarios.

**Prompts específicos**:
```
1. "Crear authService.ts con:
   - Métodos login, register, logout usando Supabase Auth
   - Gestión de sesiones persistentes
   - Integración con system_users para obtener perfil
   - Manejo de errores específicos (email en uso, socio ya asignado)"

2. "Crear userRepository.ts con:
   - CRUD completo para system_users
   - Métodos para consultas específicas (pendientes, por rol)
   - Validaciones de integridad (socio único por usuario)"

3. "Crear userRoleService.ts con:
   - Gestión de permisos basada en user_permissions
   - Métodos para activación/gestión de usuarios
   - Verificaciones de autorización"

4. "Crear modelos TypeScript para:
   - UserProfile, SystemUser, Permission, LoginResult, etc."
```

**Archivos a crear**:
- `src/infrastructure/auth/authService.ts`
- `src/infrastructure/repositories/userRepository.ts`
- `src/application/services/userRoleService.ts`
- `src/application/models/user.ts`
- `src/application/models/permission.ts`

### **Fase 3: Pantallas de Autenticación (2-3 días)**

**Objetivo**: Desarrollar UI para login, registro y estados pendientes.

**Prompts específicos**:
```
1. "Crear LoginScreen.tsx con:
   - Formularios login/registro en tabs o toggle
   - Dropdown de partners activos sin usuario en registro
   - Validación en tiempo real de email y password
   - Manejo de estados loading, error, success
   - Opción 'Recordar sesión'"

2. "Crear PendingActivationScreen.tsx con:
   - Mensaje informativo claro
   - Detalles del socio asociado
   - Botón para contactar socio gerente
   - Botón cerrar sesión"

3. "Crear LoadingScreen.tsx para estados de carga"

4. "Crear ErrorBoundary para manejo de errores en auth flow"
```

**Archivos a crear**:
- `src/ui/screens/auth/LoginScreen.tsx`
- `src/ui/screens/auth/PendingActivationScreen.tsx`
- `src/ui/screens/auth/LoadingScreen.tsx`
- `src/ui/components/auth/ErrorBoundary.tsx`

### **Fase 4: Contexto y Navegación (2 días)**

**Objetivo**: Implementar contexto de autenticación y navegación condicional.

**Prompts específicos**:
```
1. "Crear AuthContext.tsx con:
   - Estado global de autenticación
   - Métodos login, register, logout
   - Verificación de permisos
   - Persistencia de sesión (AsyncStorage)"

2. "Crear AuthNavigator.tsx que:
   - Verifique estado de auth y muestre pantalla correspondiente
   - Maneje loading states
   - Redirija según requires_activation"

3. "Modificar app/_layout.tsx para usar AuthProvider y AuthNavigator"

4. "Crear ProtectedRoute.tsx para proteger rutas específicas"
```

**Archivos a crear/modificar**:
- `src/ui/context/AuthContext.tsx`
- `src/ui/navigation/AuthNavigator.tsx`
- `app/_layout.tsx` (modificar)
- `src/ui/components/auth/ProtectedRoute.tsx`

### **Fase 5: Gestión de Usuarios (2 días)**

**Objetivo**: Pantallas para gestión de usuarios por socio gerente.

**Prompts específicos**:
```
1. "Crear UserActivationScreen.tsx para socio gerente:
   - Lista de usuarios pendientes con detalles
   - Acciones: Activar como DATA_ENTRY/PARTNER, Rechazar
   - Filtros y búsqueda
   - Confirmación antes de acciones"

2. "Crear RoleManagementScreen.tsx:
   - Lista completa de usuarios con roles actuales
   - Edición in-line de roles
   - Activación/desactivación
   - Historial de cambios (opcional)"

3. "Crear UserProfileScreen.tsx:
   - Información del usuario actual
   - Cambio de contraseña
   - Datos de contacto (editable según permisos)"
```

**Archivos a crear**:
- `src/ui/screens/users/UserActivationScreen.tsx`
- `src/ui/screens/users/RoleManagementScreen.tsx`
- `src/ui/screens/users/UserProfileScreen.tsx`

### **Fase 6: Integración y Permisos (2-3 días)**

**Objetivo**: Integrar permisos en pantallas existentes y crear tabs dinámicos.

**Prompts específicos**:
```
1. "Modificar todas las pantallas existentes para:
   - Verificar permisos antes de operaciones sensibles
   - Ocultar/mostrar elementos según permisos
   - Mostrar mensajes apropiados para usuarios no autorizados"

2. "Crear RoleBasedTabBar.tsx que:
   - Muestre tabs diferentes según rol de usuario
   - Oculte tabs no permitidos
   - Mantenga la navegación existente para backward compatibility"

3. "Modificar app/(tabs)/_layout.tsx para usar RoleBasedTabBar"

4. "Crear hooks de permisos:
   - usePermissions() para acceso fácil a permisos
   - useRole() para obtener rol actual
   - useAuthGuard() para protección de componentes"
```

**Archivos a crear/modificar**:
- `src/ui/components/navigation/RoleBasedTabBar.tsx`
- `app/(tabs)/_layout.tsx` (modificar)
- `src/ui/hooks/usePermissions.ts`
- `src/ui/hooks/useRole.ts`
- `src/ui/hooks/useAuthGuard.ts`
- Modificar todas las pantallas existentes para checks de permisos

### **Fase 7: Testing y Ajustes (1-2 días)**

**Objetivo**: Probar flujos completos y ajustar basado en feedback.

**Prompts específicos**:
```
1. "Crear tests para authService.ts cubriendo:
   - Login exitoso/fallido
   - Registro con validaciones
   - Logout y limpieza de sesión
   - Obtención de perfil de usuario"

2. "Probar flujos completos:
   - Registro → Pendiente → Activación por socio gerente → Acceso
   - Login con diferentes roles → Navegación según permisos
   - Cambio de roles por socio gerente → Efecto inmediato en UI"

3. "Ajustar UI/UX basado en testing:
   - Mejores mensajes de error
   - Estados de loading más claros
   - Confirmaciones para acciones críticas"

4. "Documentar flujos para usuarios finales y socio gerente"
```

**Archivos a crear**:
- `__tests__/authService.test.ts`
- `__tests__/userRoleService.test.ts`
- `docs/user-guides/auth-flow.md`
- `docs/admin-guides/user-management.md`

## 📝 Consideraciones Técnicas Especiales

### **1. Backward Compatibility**
- Mantener funcionalidad para usuarios existentes (p1, p2) durante transición
- Script de migración que cree usuarios del sistema para socios existentes
- Fallback a comportamiento actual si auth no está configurado
- Fase de coexistencia donde auth es opcional (configurable)

### **2. Seguridad**
- Validar emails de dominio específico si es requerido
- Limitar intentos de login (Supabase tiene rate limiting)
- Sessions con refresh tokens y revisión periódica
- Log de actividades sensibles (cambios de rol, activaciones)
- Encriptación de datos sensibles en tránsito y reposo

### **3. Performance**
- Cachear permisos en contexto para evitar queries repetidas
- Lazy loading de pantallas de gestión (solo socio gerente las ve)
- Optimizar queries con índices adecuados
- Minimizar llamadas a Supabase Auth (usar session cache)

### **4. UX/UI**
- Mensajes claros en español para todos los estados
- Loading states con feedback visual
- Transiciones suaves entre estados de auth
- Diseño responsive para login en mobile/web
- Recordatorio amigable para usuarios pendientes

### **5. Mantenibilidad**
- Código modular con separación clara de responsabilidades
- Tests unitarios y de integración
- Documentación de APIs internas
- Logging estructurado para debugging
- Configuración centralizada de roles y permisos

## 🔄 Plan de Migración Gradual

### **Etapa 1: Desarrollo y Testing Interno**
- Implementar en branch separado
- Testing con datos de prueba
- Feedback de usuarios internos

### **Etapa 2: Rollout Opcional**
- Feature flag para habilitar/deshabilitar auth
- Usuarios existentes pueden optar por usar auth
- Recolectar feedback en producción controlada

### **Etapa 3: Migración Completa**
- Forzar auth para todos los usuarios nuevos
- Migrar usuarios existentes con comunicación previa
- Soporte para problemas durante migración

### **Etapa 4: Post-Migración**
- Monitoreo de uso y performance
- Ajustes basados en analytics
- Plan de mejora continua

## 🧪 Casos de Prueba Críticos

### **Caso 1: Registro de Nuevo Usuario**
```
Entrada: Email no registrado, password válido, socio sin usuario
Salida esperada: Usuario creado en auth.users, registro en system_users como BASE pendiente
```

### **Caso 2: Activación por Socio Gerente**
```
Entrada: Socio gerente activa usuario pendiente como DATA_ENTRY
Salida esperada: requires_activation=false, user_role=DATA_ENTRY, notificación enviada
```

### **Caso 3: Login con Permisos Insuficientes**
```
Entrada: Usuario BASE intenta acceder a pantalla de gestión
Salida esperada: Redirección a pantalla no autorizada o mensaje claro
```

### **Caso 4: Cambio de Rol en Tiempo Real**
```
Entrada: Socio gerente cambia rol de PARTNER a DATA_ENTRY
Salida esperada: Cambio inmediato en UI del usuario afectado (tabs actualizados)
```

## 📋 Checklist de Completitud

### **Esquema de BD**
- [ ] Tabla system_users creada con relaciones
- [ ] Tabla user_permissions con datos iniciales
- [ ] Campos email/phone agregados a partners
- [ ] Índices para performance
- [ ] Políticas RLS configuradas

### **Servicios**
- [ ] authService.ts con login/register/logout
- [ ] userRepository.ts con CRUD completo
- [ ] userRoleService.ts con gestión de permisos
- [ ] Modelos TypeScript definidos

### **UI**
- [ ] LoginScreen.tsx con formularios
- [ ] PendingActivationScreen.tsx
- [ ] UserActivationScreen.tsx
- [ ] RoleManagementScreen.tsx
- [ ] UserProfileScreen.tsx

### **Navegación**
- [ ] AuthContext.tsx con estado global
- [ ] AuthNavigator.tsx con lógica condicional
- [ ] ProtectedRoute.tsx para protección
- [ ] RoleBasedTabBar.tsx dinámico

### **Integración**
- [ ] Todas las pantallas verifican permisos
- [ ] Tabs muestran según rol
- [ ] Mensajes de error apropiados
- [ ] Estados de loading en todas partes

### **Testing**
- [ ] Tests para servicios auth
- [ ] Tests para gestión de roles
- [ ] Flujos completos probados
- [ ] Documentación actualizada

## 🆘 Soporte y Troubleshooting

### **Problemas Comunes y Soluciones**

1. **"No puedo registrarme, socio no aparece en dropdown"**
   - Verificar que el socio esté activo en partners
   - Verificar que el socio no tenga usuario ya asignado
   - Revisar permisos del usuario actual

2. **"Usuario pendiente no aparece en lista de activaciones"**
   - Verificar que requires_activation=true
   - Verificar que el usuario logeado sea socio gerente
   - Revisar políticas RLS

3. **"Permisos no se actualizan después de cambio de rol"**
   - Forzar refresh del contexto de auth
   - Verificar cache de permisos
   - Revisar sincronización entre servicios

4. **"Session expirada no redirige a login"**
   - Verificar manejo de errores en authService
   - Revisar interceptor de requests
   - Check de session periódico

### **Contacto y Escalación**
- **Desarrollador**: Mantenimiento del sistema auth
- **Socio Gerente**: Activación de usuarios y gestión de roles
- **Admin Supabase**: Problemas con auth.users o RLS

---

## ✅ Conclusión

Este plan proporciona una guía completa para implementar un sistema de autenticación robusto y escalable en Flash Report, integrando perfectamente con la estructura existente de socios y añadiendo capacidades granularizadas de gestión de usuarios.

**Próximo paso recomendado**: Comenzar con **Fase 1: Preparación del Esquema** ejecutando la migración SQL en Supabase y creando los scripts de migración para usuarios existentes.

**Tiempo estimado total**: 12-17 días de desarrollo distribuido en 7 fases.

**Riesgos principales**:
1. Complejidad de integración con sistema existente
2. Migración de usuarios existentes sin interrupción
3. Curva de aprendizaje para usuarios finales

**Mitigaciones**:
1. Desarrollo en branch separado con testing extensivo
2. Feature flags para rollout gradual
3. Documentación clara y capacitación para usuarios