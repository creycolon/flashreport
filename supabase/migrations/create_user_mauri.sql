-- =============================================================================
-- CREAR NUEVO USUARIO EN AUTH - OPCIONES
-- =============================================================================

-- =============================================================================
-- OPCIÓN 1: Desde Dashboard de Supabase (RECOMENDADO)
-- =============================================================================
-- 1. Ve a: https://supabase.com/dashboard/project/mjyjavwuguzmwxofdxsr/auth/users
-- 2. Click "Add user"
-- 3. Email: mauri@tusistema.com
-- 4. Password: Maurit123!
-- 5. ✅ Email confirm: enabled
-- 6. Click "Create user"
-- 7. Copiar el UUID generado
-- 8. Ejecutar:
--    UPDATE partners SET supabase_id = 'UUID_GENERADO' WHERE id = 2;

-- =============================================================================
-- OPCIÓN 2: Usando CLI de Supabase
-- =============================================================================
-- npx supabase auth signup mauri@tusistema.com --password Maurit123!

-- =============================================================================
-- OPCIÓN 3: Intentar con trigger/función (menos común)
-- =============================================================================

-- Ver si existe la función de signup
SELECT proname, pronargs 
FROM pg_proc 
WHERE proname = 'signup';

-- Ver tablas en schema auth
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'auth';

-- =============================================================================
-- VERIFICACIÓN FINAL
-- =============================================================================
SELECT 
  p.id as partner_id,
  p.name,
  p.email as partner_email,
  p.supabase_id,
  u.id as auth_id,
  u.email as auth_email,
  u.created_at as auth_created
FROM partners p
LEFT JOIN auth.users u ON p.supabase_id::text = u.id::text
WHERE p.id = 2;
