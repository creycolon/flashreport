import { getDatabase } from '../db/database';
import { generateId } from '../../application/utils/idGenerator';

export const businessUnitRepository = {
    getAll: async (includeInactive = false) => {
        console.log('[businessUnitRepo] getAll, includeInactive:', includeInactive);
        const db = await getDatabase();
        const sql = includeInactive
            ? 'SELECT * FROM business_units ORDER BY is_active DESC, display_order ASC'
            : 'SELECT * FROM business_units WHERE is_active = 1 ORDER BY display_order ASC';
        console.log('[businessUnitRepo] sql:', sql);
        const result = await db.getAllAsync(sql);
        console.log('[businessUnitRepo] result:', result);
        return result;
    },

    getById: async (id) => {
        const db = await getDatabase();
        return await db.getFirstAsync('SELECT * FROM business_units WHERE id = ?', [id]);
    },

    create: async ({ name, color, location, displayOrder = 0 }) => {
        const db = await getDatabase();
        const id = generateId();
        await db.runAsync(
            'INSERT INTO business_units (id, name, color, location, display_order, is_active) VALUES (?, ?, ?, ?, ?, 1)',
            [id, name, color, location, displayOrder]
        );
        return { id, name, color, location, displayOrder };
    },

    update: async (id, { name, color, location, displayOrder, isActive = 1 }) => {
        const db = await getDatabase();
        await db.runAsync(
            'UPDATE business_units SET name = ?, color = ?, location = ?, display_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [name, color, location, displayOrder, isActive, id]
        );
        return true;
    },

    softDelete: async (id) => {
        const db = await getDatabase();
        await db.runAsync('UPDATE business_units SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
        return true;
    },

    reactivate: async (id) => {
        const db = await getDatabase();
        await db.runAsync('UPDATE business_units SET is_active = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
        return true;
    }
};
