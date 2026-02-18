# Prompts para Implementación del Sistema de Autenticación

## 📋 Instrucciones de Uso

Cada fase tiene prompts específicos que puedes usar con opencode para implementar esa parte del sistema. Copia el prompt completo y ajústalo según sea necesario.

---

## 🚀 **Fase 1: Preparación del Esquema (Días 1-2)**

### **Prompt 1.1: Crear migración SQL completa**
```
Crea una migración SQL completa para el sistema de autenticación que incluya:

1. Tabla `system_users` con:
   - `id` UUID primary key
   - `auth_user_id` UUID referencia a `auth.users(id)` ON DELETE CASCADE
   - `partner_id` TEXT referencia a `partners(id)` ON DELETE CASCADE
   - `user_role` TEXT CHECK en ('BASE', 'DATA_ENTRY', 'PARTNER', 'MANAGING_PARTNER', 'ADMIN')
   - `is_active` BOOLEAN DEFAULT true
   - `requires_activation` BOOLEAN DEFAULT true
   - Constraints UNIQUE para auth_user_id y partner_id
   - Índices para auth_user_id, partner_id, y (user_role, is_active)

2. Tabla `user_permissions` con:
   - `user_role` TEXT (mismos valores que arriba)
   - `permission_key` TEXT (ej: 'view_dashboard', 'create_movements')
   - `permission_value` BOOLEAN DEFAULT false
   - Constraint UNIQUE(user_role, permission_key)

3. Insertar permisos por defecto para cada rol:
   - BASE: solo view_dashboard=true
   - DATA_ENTRY: view_dashboard, view_movements, create_movements=true
   - PARTNER: todos permisos excepto manage_users
   - MANAGING_PARTNER: todos permisos incluyendo manage_users
   - ADMIN: todos permisos=true

4. Agregar campos a `partners`:
   - `email` TEXT UNIQUE
   - `phone` TEXT
   - `contact_name` TEXT

5. Habilitar RLS en las nuevas tablas con políticas básicas:
   - Usuarios pueden ver su propio perfil
   - MANAGING_PARTNER y ADMIN pueden gestionar todos usuarios
   - Todos autenticados pueden ver permisos

Guarda el archivo como `supabase/migrations/2025021901_auth_system.sql`
```

### **Prompt 1.2: Script de migración para usuarios existentes**
```
Crea un script Node.js para migrar usuarios existentes (p1, p2) al nuevo sistema:

1. Usar Supabase Admin API para crear usuarios en `auth.users`:
   - p1: email "admin@flashreport.local", password temporal
   - p2: email "partner@flashreport.local", password temporal

2. Insertar registros en `system_users`:
   - p1 como MANAGING_PARTNER, is_active=true, requires_activation=false
   - p2 como PARTNER, is_active=true, requires_activation=false

3. Actualizar tabla `partners` con emails para p1 y p2

4. El script debe:
   - Leer credenciales de .env.local (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
   - Mostrar progreso paso a paso
   - Manejar errores y rollback si falla
   - Generar reporte final con credenciales temporales

Guarda como `scripts/migrate_existing_users.js`
```

---

## 🛠️ **Fase 2: Servicios de Autenticación (Días 3-5)**

### **Prompt 2.1: Crear authService.ts**
```
Implementa `src/infrastructure/auth/authService.ts` con:

1. Métodos principales:
   - `login(email, password, partnerId?)`: Autentica con Supabase, obtiene perfil de system_users
   - `register(email, password, partnerId)`: Crea en auth.users y system_users (BASE pendiente)
   - `logout()`: Cierra sesión y limpia almacenamiento local
   - `getCurrentSession()`: Obtiene sesión actual con refresh automático
   - `getCurrentUserProfile()`: Obtiene perfil completo con permisos

2. Manejo de errores específicos:
   - "Email already registered"
   - "Partner already has user"
   - "Invalid partner selection"
   - "Account pending activation"

3. Integración con almacenamiento local (AsyncStorage):
   - Persistir session token
   - Cachear perfil de usuario
   - Recordar última sesión

4. Typescript interfaces para:
   - UserProfile
   - LoginResult
   - RegisterResult
   - AuthError

Usa el cliente Supabase existente en `src/infrastructure/db/supabaseClient.js`
```

### **Prompt 2.2: Crear userRepository.ts**
```
Implementa `src/infrastructure/repositories/userRepository.ts` con:

1. CRUD completo para `system_users`:
   - `create(userData)`: Valida unicidad de auth_user_id y partner_id
   - `findById(userId)`, `findByAuthId(authUserId)`, `findByPartnerId(partnerId)`
   - `update(userId, updates)`: Solo campos permitidos
   - `softDelete(userId)`: is_active=false

2. Consultas específicas:
   - `findPendingActivations()`: requires_activation=true
   - `findByRole(role)`: Filtrado por user_role
   - `findActiveUsers()`: is_active=true

3. Validaciones:
   - `isPartnerAvailable(partnerId)`: Verifica si socio no tiene usuario
   - `emailExists(email)`: Busca en partners.email

4. Métodos helper para:
   - Obtener permisos de un usuario (join con user_permissions)
   - Verificar si usuario puede gestionar otros usuarios

Sigue el mismo patrón que `partnerRepository.js`
```

### **Prompt 2.3: Crear userRoleService.ts**
```
Implementa `src/application/services/userRoleService.ts` con:

1. Gestión de permisos:
   - `getUserPermissions(userId)`: Obtiene todos permisos del rol del usuario
   - `hasPermission(userId, permissionKey)`: Verifica permiso específico
   - `canManageUsers(userId)`: Verifica si puede gestionar usuarios

2. Operaciones para socio gerente/admin:
   - `getPendingActivations()`: Lista usuarios pendientes con detalles
   - `assignUserRole(userId, newRole)`: Cambia rol y actualiza permisos
   - `activateUser(userId)`: requires_activation=false
   - `deactivateUser(userId)`: is_active=false

3. Consultas para UI:
   - `getAvailablePartnersForRegistration()`: Socios activos sin usuario
   - `getAllUsers()`: Lista completa para gestión

4. Validaciones de negocio:
   - No puede haber múltiples MANAGING_PARTNER activos
   - No puede desactivar último MANAGING_PARTNER
   - Verificaciones antes de cambiar roles
```

---

## 📱 **Fase 3: Pantallas de Autenticación (Días 6-8)**

### **Prompt 3.1: Crear LoginScreen.tsx**
```
Crea `src/ui/screens/auth/LoginScreen.tsx` con:

1. Dos modos (toggle o tabs):
   - **Login**: Email, Password, "Recordar sesión"
   - **Registro**: Email, Password, Confirmar Password, Dropdown de socios disponibles

2. Dropdown de socios:
   - Consulta `userRoleService.getAvailablePartnersForRegistration()`
   - Muestra nombre y porcentaje de participación
   - Deshabilitado si no hay socios disponibles

3. Validación en tiempo real:
   - Formato email válido
   - Password mínimo 8 caracteres
   - Coincidencia de passwords en registro
   - Socio seleccionado en registro

4. Estados visuales:
   - Loading durante login/registro
   - Mensajes de error específicos
   - Success con redirección automática

5. UX adicional:
   - "Olvidé mi contraseña" link
   - Toggle mostrar/ocultar password
   - Auto-focus en primer campo

Diseño responsive que siga el theme existente
```

### **Prompt 3.2: Crear PendingActivationScreen.tsx**
```
Crea `src/ui/screens/auth/PendingActivationScreen.tsx` para usuarios pendientes:

1. Mensaje principal claro:
   - "Tu cuenta está pendiente de activación"
   - "El socio gerente debe activar tu acceso"

2. Detalles mostrados:
   - Email registrado
   - Socio asociado (nombre, porcentaje)
   - Fecha y hora de registro
   - Tiempo estimado de espera

3. Acciones disponibles:
   - "Cerrar sesión" (vuelve a login)
   - "Contactar al socio gerente" (si hay email configurado)
   - "Reintentar" (verificar si ya fue activado)

4. Diseño amigable:
   - Icono de reloj o espera
   - Progress bar animada (opcional)
   - Mensaje de tranquilidad

Esta pantalla se muestra cuando `userProfile.requiresActivation === true`
```

### **Prompt 3.3: Crear LoadingScreen y ErrorBoundary**
```
Crea componentes de soporte para auth:

1. `src/ui/screens/auth/LoadingScreen.tsx`:
   - Spinner animado
   - Mensaje configurable ("Iniciando sesión...", "Cargando...")
   - Logo de la aplicación
   - Timeout warning después de 10 segundos

2. `src/ui/components/auth/ErrorBoundary.tsx`:
   - Catch errors en auth flow
   - Mostrar mensaje amigable
   - Botón "Reintentar" y "Volver a login"
   - Log error a console para debugging

3. `src/ui/components/auth/NetworkStatus.tsx`:
   - Indicador de conexión
   - Alert cuando no hay internet
   - Auto-reconexión para auth
```

---

## 🧭 **Fase 4: Contexto y Navegación (Días 9-10)**

### **Prompt 4.1: Crear AuthContext.tsx**
```
Implementa `src/ui/context/AuthContext.tsx` con:

1. Estado global:
   - `user`: UserProfile | null
   - `session`: Session | null  
   - `permissions`: Permission[]
   - `isLoading`: boolean
   - `error`: AuthError | null

2. Acciones:
   - `login(email, password, partnerId?)`: Llama a authService.login
   - `register(email, password, partnerId)`: Llama a authService.register
   - `logout()`: Limpia todo estado
   - `refreshUser()`: Recarga perfil y permisos
   - `clearError()`: Limpia errores

3. Utilidades:
   - `hasPermission(permissionKey)`: Verifica contra permissions array
   - `canAccess(routeName)`: Verifica si puede acceder a ruta
   - `getUserRole()`: Retorna user_role actual

4. Efectos secundarios:
   - Auto-check session al montar
   - Persistencia en AsyncStorage
   - Auto-logout cuando session expira
   - Sync entre tabs (web)

Sigue el patrón de ThemeContext existente
```

### **Prompt 4.2: Crear AuthNavigator.tsx**
```
Crea `src/ui/navigation/AuthNavigator.tsx` que maneje navegación condicional:

1. Lógica de routing:
   - Si `isLoading` → `LoadingScreen`
   - Si `!session` → `LoginScreen`
   - Si `session && user?.requiresActivation` → `PendingActivationScreen`
   - Si `session && user && !user.requiresActivation` → `MainAppTabs`

2. `MainAppTabs` debe:
   - Recibir `userRole` como prop
   - Renderizar `RoleBasedTabBar` con tabs según rol
   - Pasar navigation prop a todas las pantallas

3. Manejo de deep linking:
   - Preservar intended route después de login
   - Redirección después de activación
   - Handle logout desde cualquier pantalla

4. Integración con Expo Router:
   - Usar `router` para navegación
   - Preserve query params
   - Handle back navigation apropiadamente
```

### **Prompt 4.3: Modificar app/_layout.tsx**
```
Modifica `app/_layout.tsx` para integrar autenticación:

1. Envolver todo en `AuthProvider`:
   ```tsx
   <GestureHandlerRootView style={{ flex: 1 }}>
     <ThemeProvider>
       <AuthProvider>
         <AuthNavigator />
       </AuthProvider>
     </ThemeProvider>
   </GestureHandlerRootView>
   ```

2. Remover `AppInitializer` directo, moverlo dentro de `AuthProvider`:
   - `AppInitializer` solo después de autenticación exitosa
   - O integrar inicialización en `AuthProvider`

3. Actualizar imports para incluir:
   - `AuthProvider` desde nuevo contexto
   - `AuthNavigator` desde nuevo componente

4. Mantener logging para debugging pero reducir console.error
```

### **Prompt 4.4: Crear ProtectedRoute.tsx**
```
Crea `src/ui/components/auth/ProtectedRoute.tsx` wrapper component:

1. Props:
   - `children`: ReactNode a proteger
   - `requiredPermissions`: string[] de permisos requeridos
   - `requiredRole`: UserRole específico requerido
   - `fallbackComponent`: Componente a mostrar si no autorizado
   - `redirectTo`: Ruta a redirigir (default: '/login')

2. Lógica:
   - Usar `useAuth()` hook para obtener estado
   - Verificar `requiredRole` si proporcionado
   - Verificar `requiredPermissions` si proporcionado
   - Si no autorizado, mostrar `fallbackComponent` o redirigir

3. Uso ejemplo:
   ```tsx
   <ProtectedRoute requiredPermissions={['manage_users']}>
     <UserActivationScreen />
   </ProtectedRoute>
   ```

4. Variantes:
   - `PublicOnlyRoute`: Solo para no autenticados
   - `RoleSpecificRoute`: Para roles específicos
```

---

## 👥 **Fase 5: Gestión de Usuarios (Días 11-12)**

### **Prompt 5.1: Crear UserActivationScreen.tsx**
```
Crea `src/ui/screens/users/UserActivationScreen.tsx` para socio gerente:

1. Lista de usuarios pendientes:
   - Email, socio asociado, fecha registro
   - Estado actual (pendiente desde X días)
   - Acciones rápidas: Activar como DATA_ENTRY/PARTNER, Rechazar

2. Filtros y búsqueda:
   - Filtrar por socio específico
   - Buscar por email o nombre de socio
   - Ordenar por fecha (más reciente/viejo)

3. Proceso de activación:
   - Modal de confirmación con detalles
   - Opción de enviar notificación email
   - Feedback inmediato de éxito/error

4. Estadísticas:
   - Total pendientes
   - Promedio tiempo de espera
   - Historial de activaciones recientes

Solo accesible para MANAGING_PARTNER y ADMIN
```

### **Prompt 5.2: Crear RoleManagementScreen.tsx**
```
Crea `src/ui/screens/users/RoleManagementScreen.tsx` para gestión completa:

1. Lista maestra de usuarios:
   - Todos los usuarios con sus roles actuales
   - Estado activo/inactivo
   - Última actividad (login)
   - Socio asociado

2. Edición in-place:
   - Click en rol para cambiar (dropdown)
   - Toggle activo/inactivo
   - Botón "Reset password" (envía email)

3. Filtros avanzados:
   - Por rol, estado activo, socio
   - Usuarios sin actividad reciente
   - Usuarios con múltiples sesiones

4. Reportes y acciones batch:
   - Exportar a CSV
   - Desactivar múltiples usuarios
   - Cambiar rol a grupo de usuarios

5. Auditoría:
   - Historial de cambios de rol
   - Quién realizó cada cambio
   - Timestamp de cada modificación
```

### **Prompt 5.3: Crear UserProfileScreen.tsx**
```
Crea `src/ui/screens/users/UserProfileScreen.tsx` para auto-gestión:

1. Información personal:
   - Email (no editable)
   - Socio asociado (no editable)
   - Rol actual (no editable por usuario)
   - Fecha de registro

2. Seguridad:
   - Cambiar contraseña (antigua, nueva, confirmar)
   - Sesiones activas (cerrar otras sesiones)
   - 2FA (opcional futuro)

3. Preferencias:
   - Tema preferido (auto/light/dark)
   - Notificaciones por email
   - Idioma (si soportado)

4. Datos de contacto (si es socio):
   - Teléfono (editable)
   - Nombre de contacto
   - Email alternativo

Accesible desde Settings o menú de usuario
```

---

## 🔗 **Fase 6: Integración y Permisos (Días 13-15)**

### **Prompt 6.1: Crear RoleBasedTabBar.tsx**
```
Crea `src/ui/components/navigation/RoleBasedTabBar.tsx`:

1. Configuración centralizada de tabs por rol:
   ```typescript
   const TAB_CONFIG = {
     BASE: [{ name: 'dashboard', label: 'Resumen', icon: 'stats-chart' }],
     DATA_ENTRY: [
       { name: 'movements', label: 'Movimientos', icon: 'list' },
       { name: 'add', label: 'Agregar', icon: 'add-circle' }
     ],
     // ... completar para PARTNER y MANAGING_PARTNER
   }
   ```

2. Componente que:
   - Recibe `userRole` como prop
   - Renderiza solo los tabs permitidos
   - Mantiene active state y navegación
   - Oculta completamente tabs no permitidos

3. Integración con `app/(tabs)/_layout.tsx`:
   - Reemplazar `CustomTabBar` actual
   - Pasar `userRole` desde AuthContext
   - Mantener misma apariencia visual

4. Handle tabs especiales:
   - Tab "Usuarios" solo para MANAGING_PARTNER
   - Badge para usuarios pendientes de activación
   - Indicador de rol actual
```

### **Prompt 6.2: Modificar pantallas existentes para permisos**
```
Modifica TODAS las pantallas existentes para verificar permisos:

1. Para cada pantalla (`DashboardScreen.tsx`, `MovementsListScreen.tsx`, etc.):
   - Agregar `useAuth()` hook al inicio
   - Verificar permisos antes de operaciones sensibles
   - Mostrar mensaje o redirigir si no autorizado

2. Ejemplos específicos:
   - **DashboardScreen**: Verificar `view_dashboard` permiso
   - **MovementsListScreen**: Verificar `view_movements`
   - **AddMovementScreen**: Verificar `create_movements`
   - **PartnersScreen**: Verificar `manage_partners`
   - **SettingsScreen**: Mostrar secciones según permisos

3. Patrón a seguir:
   ```tsx
   const { hasPermission } = useAuth();
   
   if (!hasPermission('view_dashboard')) {
     return <UnauthorizedScreen message="No tienes permiso para ver el dashboard" />;
   }
   ```

4. Componente `UnauthorizedScreen.tsx` reutilizable
```

### **Prompt 6.3: Crear hooks de permisos**
```
Crea hooks utilitarios en `src/ui/hooks/`:

1. `usePermissions.ts`:
   ```typescript
   function usePermissions() {
     const { permissions } = useAuth();
     
     return {
       hasPermission: (key: string) => permissions.some(p => p.key === key && p.value),
       hasAnyPermission: (keys: string[]) => keys.some(key => hasPermission(key)),
       hasAllPermissions: (keys: string[]) => keys.every(key => hasPermission(key))
     };
   }
   ```

2. `useRole.ts`:
   ```typescript
   function useRole() {
     const { user } = useAuth();
     
     return {
       role: user?.userRole || null,
       isManagingPartner: user?.userRole === 'MANAGING_PARTNER',
       isPartner: user?.userRole === 'PARTNER',
       isDataEntry: user?.userRole === 'DATA_ENTRY',
       isBaseUser: user?.userRole === 'BASE'
     };
   }
   ```

3. `useAuthGuard.ts`:
   ```typescript
   function useAuthGuard(requiredPermissions?: string[], requiredRole?: UserRole) {
     const { hasPermission, user } = useAuth();
     const router = useRouter();
     
     useEffect(() => {
       // Lógica de verificación y redirección
     }, []);
     
     return { isAuthorized: /* resultado */ };
   }
   ```

4. Tests para cada hook
```

### **Prompt 6.4: Integrar permisos en componentes UI**
```
Modifica componentes UI para reflejar permisos:

1. **Buttons**: Deshabilitar según permisos
   ```tsx
   <Button 
     title="Agregar Movimiento" 
     disabled={!hasPermission('create_movements')}
   />
   ```

2. **Menu items**: Ocultar según permisos
   ```tsx
   {hasPermission('manage_users') && (
     <MenuItem title="Gestión de Usuarios" onPress={() => {}} />
   )}
   ```

3. **Forms**: Mostrar/ocultar campos según rol
   ```tsx
   {isManagingPartner && (
     <FormField label="Asignar a Socio" />
   )}
   ```

4. **Lists**: Filtrar datos según permisos
   ```tsx
   const visibleData = data.filter(item => 
     hasPermission(`view_${item.type}`)
   );
   ```
```

---

## 🧪 **Fase 7: Testing y Ajustes (Días 16-17)**

### **Prompt 7.1: Crear tests para authService**
```
Crea tests en `__tests__/authService.test.ts`:

1. Setup con mocking:
   - Mock Supabase client
   - Mock AsyncStorage
   - Mock fetch/network

2. Tests para login:
   - Login exitoso retorna UserProfile
   - Login con credenciales incorrectas lanza error
   - Login con usuario pendiente lanza error específico
   - Login sin internet maneja error apropiadamente

3. Tests para registro:
   - Registro exitoso crea usuario en ambos sistemas
   - Registro con email existente lanza error
   - Registro con socio ya asignado lanza error
   - Validación de campos en registro

4. Tests para logout:
   - Limpia session token
   - Limpia cache local
   - Notifica a listeners apropiadamente

5. Tests de integración:
   - Flujo completo login → uso → logout
   - Persistencia entre sessions
   - Handle token refresh automático
```

### **Prompt 7.2: Probar flujos completos**
```
Crea script de testing manual para flujos completos:

1. **Flujo de registro y activación**:
   ```
   1. Usuario nuevo se registra (email, password, socio)
   2. Verificar que aparece en PendingActivationScreen
   3. Socio gerente inicia sesión
   4. Socio gerente activa usuario como DATA_ENTRY
   5. Usuario puede iniciar sesión y ver tabs de DATA_ENTRY
   6. Usuario solo puede crear movimientos, no gestionar socios
   ```

2. **Flujo de cambio de rol**:
   ```
   1. Socio gerente cambia rol de PARTNER a DATA_ENTRY
   2. Usuario afectado ve cambios inmediatos (tabs actualizados)
   3. Verificar que permisos se actualizaron correctamente
   4. Usuario no puede acceder a funciones de PARTNER
   ```

3. **Flujo de edge cases**:
   ```
   1. Usuario BASE intenta acceder a pantalla protegida
   2. DATA_ENTRY intenta gestionar socios
   3. Múltiples sesiones simultáneas
   4. Recuperación de sesión después de expire
   ```

4. Documentar resultados y bugs encontrados
```

### **Prompt 7.3: Ajustes de UI/UX basados en testing**
```
Realiza ajustes basados en testing:

1. **Mejoras de mensajes de error**:
   - Traducir todos los mensajes de Supabase a español amigable
   - Agregar sugerencias para errores comunes
   - Mostrar "¿Necesitas ayuda?" link para errores críticos

2. **Estados de loading**:
   - Agregar skeletons para carga inicial
   - Mostrar progreso para operaciones largas
   - Timeout con opción de reintentar

3. **Confirmaciones para acciones críticas**:
   - Modal de confirmación para cambiar roles
   - Advertencia al desactivar usuario
   - Confirmación de logout si hay cambios no guardados

4. **Accesibilidad**:
   - Labels para screen readers
   - Contraste adecuado en todos los estados
   - Navegación por teclado (web)
   - Tamaños de texto escalables

5. **Performance**:
   - Lazy loading de pantallas de gestión
   - Cache de permisos para evitar queries repetidas
   - Optimizar re-renders con React.memo
```

### **Prompt 7.4: Documentación final**
```
Crea documentación completa:

1. **Para usuarios finales** (`docs/user-guides/auth-flow.md`):
   - Cómo registrarse por primera vez
   - Qué hacer mientras esperas activación
   - Cómo cambiar tu contraseña
   - Solución de problemas comunes

2. **Para socio gerente** (`docs/admin-guides/user-management.md`):
   - Cómo activar nuevos usuarios
   - Cómo asignar y cambiar roles
   - Best practices para gestión de usuarios
   - Auditoría y reportes

3. **Para desarrolladores** (`docs/technical/auth-architecture.md`):
   - Diagrama de arquitectura
   - Flujo de datos completo
   - API reference de servicios
   - Guía de extensión (agregar nuevos permisos/roles)

4. **Checklist de rollout**:
   - Pasos para migración en producción
   - Comunicación a usuarios existentes
   - Plan de rollback si hay problemas
   - Monitoreo post-implementación
```

---

## 🆘 **Soporte y Troubleshooting**

### **Prompt de diagnóstico común**
```
Estoy teniendo problemas con el sistema de autenticación. Por favor ayuda a diagnosticar:

1. **Error específico**: [Pegar error message aquí]
2. **Contexto**: [Login/Registro/Activación/etc.]
3. **Rol de usuario**: [BASE/DATA_ENTRY/PARTNER/etc.]
4. **Pasos para reproducir**: [Descripción paso a paso]

Por favor:
1. Revisa logs de Supabase Auth
2. Verifica políticas RLS en las tablas
3. Comprueba que los usuarios existentes fueron migrados correctamente
4. Verifica la configuración de .env.local
5. Sugiere solución específica
```

### **Prompt para agregar nuevo permiso**
```
Necesito agregar un nuevo permiso al sistema. El permiso es: [nombre del permiso]

Por favor:
1. Agrega el permiso a la tabla `user_permissions` para todos los roles
2. Actualiza el TypeScript type `PermissionKey`
3. Agrega el permiso a la UI de gestión de permisos (si existe)
4. Actualiza la documentación de permisos
5. Crea migración SQL para el cambio

El permiso debería tener estos valores por defecto:
- BASE: false
- DATA_ENTRY: [true/false]
- PARTNER: [true/false] 
- MANAGING_PARTNER: [true/false]
- ADMIN: true
```

### **Prompt para agregar nuevo rol**
```
Necesito agregar un nuevo rol al sistema. El rol es: [nombre del rol]

Por favor:
1. Agrega el rol al CHECK constraint en `system_users.user_role`
2. Agrega el rol al TypeScript type `UserRole`
3. Define permisos por defecto en `user_permissions`
4. Actualiza `RoleBasedTabBar.tsx` para incluir tabs para este rol
5. Actualiza `userRoleService.ts` para manejar el nuevo rol
6. Crea migración SQL completa
7. Actualiza toda la documentación
```

---

## ✅ **Checklist Final de Implementación**

### **Antes de Rollout a Producción**
```
Por favor verifica que:

1. [ ] Migración SQL ejecutada en producción
2. [ ] Usuarios existentes (p1, p2) migrados exitosamente
3. [ ] Feature flag para habilitar/deshabilitar auth
4. [ ] Backup completo de base de datos pre-migración
5. [ ] Comunicación enviada a usuarios sobre el cambio
6. [ ] Plan de rollback documentado y probado
7. [ ] Monitoreo configurado para errores de auth
8. [ ] Equipo de soporte entrenado en nuevo sistema
```

### **Después de Rollout**
```
Por favor monitorea:

1. [ ] Tasa de éxito de login/registro
2. [ ] Tiempo promedio de activación por socio gerente
3. [ ] Errores comunes reportados por usuarios
4. [ ] Performance del sistema con auth habilitado
5. [ ] Uso de diferentes roles y permisos
6. [ ] Feedback de usuarios sobre nueva experiencia
```

---

**Nota**: Estos prompts están diseñados para usarse secuencialmente. Cada fase depende de la anterior. Ajusta los tiempos según disponibilidad y prioridades.