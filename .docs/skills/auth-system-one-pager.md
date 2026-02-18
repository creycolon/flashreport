# Sistema de Autenticación - Resumen Ejecutivo

## 🎯 Objetivo
Agregar autenticación con **Supabase Auth** + gestión granular de roles, integrado con la tabla existente de `partners`.

## 📊 Roles Propuestos
1. **BASE** → Usuario nuevo, pendiente de activación (solo lectura)
2. **DATA_ENTRY** → Solo puede crear movimientos (empleado)
3. **PARTNER** → Socio regular (acceso completo a sus operaciones)
4. **MANAGING_PARTNER** → Socio gerente existente + gestión de usuarios
5. **ADMIN** → Superusuario (backup)

## 🔐 Flujo Principal
```
Nuevo usuario → Registro (email + socio) → Pendiente de activación → 
Socio gerente activa (asigna rol) → Acceso según permisos
```

## 🗓️ Timeline Estimado
**Total: 12-17 días** (distribuido en 7 fases)

### Fase 1: Esquema BD (1-2 días)
- Tablas `system_users`, `user_permissions`
- Campos adicionales en `partners`
- RLS y migración usuarios existentes

### Fase 2: Servicios (2-3 días)
- `authService.ts` (login/register/logout)
- `userRepository.ts` (CRUD usuarios)
- `userRoleService.ts` (gestión de permisos)

### Fase 3: Pantallas Auth (2-3 días)
- `LoginScreen.tsx` (login + registro)
- `PendingActivationScreen.tsx`
- `LoadingScreen.tsx`

### Fase 4: Contexto/Navegación (2 días)
- `AuthContext.tsx` (estado global)
- `AuthNavigator.tsx` (router condicional)
- `ProtectedRoute.tsx` (protección de rutas)

### Fase 5: Gestión Usuarios (2 días)
- `UserActivationScreen.tsx` (socio gerente)
- `RoleManagementScreen.tsx`
- `UserProfileScreen.tsx`

### Fase 6: Integración (2-3 días)
- `RoleBasedTabBar.tsx` (tabs dinámicos)
- Hooks: `usePermissions`, `useRole`
- Modificar pantallas existentes para checks de permisos

### Fase 7: Testing (1-2 días)
- Tests unitarios
- Flujos completos
- Ajustes UI/UX

## 📁 Archivos Clave Nuevos
```
src/infrastructure/auth/authService.ts
src/infrastructure/repositories/userRepository.ts
src/application/services/userRoleService.ts
src/ui/context/AuthContext.tsx
src/ui/screens/auth/LoginScreen.tsx
src/ui/screens/users/UserActivationScreen.tsx
src/ui/components/navigation/RoleBasedTabBar.tsx
supabase/migrations/2025021901_auth_system.sql
```

## 🚨 Riesgos y Mitigaciones
| Riesgo | Mitigación |
|--------|------------|
| Complejidad de integración | Desarrollo en branch separado + testing extensivo |
| Migración usuarios existentes | Script de migración + feature flags |
| Curva de aprendizaje usuarios | Documentación clara + capacitación |

## ✅ Próximos Pasos Inmediatos
1. **Ejecutar Fase 1**: Crear migración SQL y migrar usuarios p1/p2
2. **Revisar prompts detallados** en `auth-system-prompts.md`
3. **Comenzar implementación** fase por fase usando los prompts

## 📞 Contacto para Dudas
- **Esquema BD**: Revisar `auth-system-implementation.md` sección 2
- **Prompts específicos**: `auth-system-prompts.md`
- **Casos de uso**: Sección 7 del documento principal

---

**Documentos completos:**
- `auth-system-implementation.md` → Plan detallado (17 páginas)
- `auth-system-prompts.md` → Prompts por fase (para usar con opencode)
- `auth-system-one-pager.md` → Este resumen ejecutivo

**Estado:** ✅ Plan completado, listo para implementación fase por fase