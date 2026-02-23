---
name: supabase_login_skill
description: Plan for integrating Supabase authentication using UUIDs while keeping existing numeric IDs, adding supabase_id column, trigger, and helper functions.
---

## Objetivo
Implementar login con Supabase usando UUIDs sin tener que refactorizar todas las referencias al campo `id` existente en la aplicación.

### Estrategia resumida
1. **Base de datos**
   - Añadir columna `supabase_id UUID` a la tabla `partners` y crear un índice único.
   - Mantener la columna `id` (INTEGER) como PK usada por el resto de la app.
   - Sincronizar `supabase_id` con la tabla `app_users` mediante el trigger `sync_app_user` que ya está creado para `auth.users`.
2. **Sincronización**
   - Cuando un usuario se registra o inicia sesión, el trigger inserta/actualiza automáticamente su registro en `app_users`.
   - Un **script de migración** opcional rellena `supabase_id` para usuarios existentes.
3. **Capa de abstracción en el cliente**
   - Crear un helper `getCurrentPartnerId()` que, una vez autenticado, consulta `partners` por `supabase_id = auth.uid()` y devuelve el `id` numérico.
   - Guardar ese `partner.id` en un store global (Context/Redux/Zustand) para reutilizarlo en toda la UI.
4. **Uso en la app**
   - Todas las consultas actuales (`select id, nombre, email …`) siguen usando el `id` numérico.
   - Sólo el **primer** acceso después del login necesita buscar por `supabase_id`.
5. **Seguridad (RLS)**
   - Añadir políticas `ROW LEVEL SECURITY` que usen `auth.uid()` para limitar el acceso a los registros cuyo `supabase_id` coincida.
   - Ejemplo:
   ```sql
   create policy "owner can read/write" on partners
   using (supabase_id = auth.uid())
   with check (supabase_id = auth.uid());
   ```
6. **Testing**
   - Crear usuarios de prueba, verificar que el trigger crea `app_users` y que la columna `supabase_id` en `partners` se rellena.
   - Probar que `getCurrentPartnerId()` devuelve el número correcto y que todas las pantallas funcionan sin cambios.

### Paso a paso detallado
| Paso | Acción | Comentario |
|------|--------|------------|
| 1 | `ALTER TABLE partners ADD COLUMN supabase_id UUID;` | Añade columna. |
| 2 | `CREATE UNIQUE INDEX idx_partners_supabase_id ON partners(supabase_id);` | Índice para búsquedas rápidas. |
| 3 | **Trigger** `sync_app_user` (ya creado) mantiene `app_users` sincronizada con `auth.users`. |
| 4 | (Opcional) Script de migración para rellenar `supabase_id` de usuarios existentes. |
| 5 | Implementar helper en `src/core/application/services/authHelper.ts`:
```ts
import { supabase } from '@/core/infrastructure/db/supabaseClient';
export async function getCurrentPartnerId(): Promise<number | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('partners')
    .select('id')
    .eq('supabase_id', user.id)
    .single();
  if (error) {
    console.error('Error fetching partner id:', error);
    return null;
  }
  return data.id as number;
}
``` |
| 6 | Guardar el `partnerId` en un store global (ej. `PartnerContext`). |
| 7 | Reemplazar usos directos de `supabase_id` por `partnerId` obtenido del store. |
| 8 | Añadir RLS a `partners` y a cualquier tabla que tenga `created_by`/`owner_id` usando `auth.uid()`. |
| 9 | Ejecutar pruebas manuales y automatizadas. |

## Beneficios
- **Mínimo impacto** en el código existente.
- **Consistencia**: todas las relaciones siguen usando `id` (INTEGER).
- **Escalabilidad**: el UUID de Supabase sirve como clave externa segura.
- **Seguridad**: RLS protege los datos por usuario.

---

*Este skill puede ser reutilizado en cualquier proyecto que necesite integrar Supabase Auth manteniendo IDs internos.*
