export const seedInitialData = async (db) => {
    console.log('[Seed] seedInitialData started with db:', db ? 'provided' : 'not provided');
    if (!db) {
        // Fallback for backward compatibility
        const { getDatabase } = await import('./database');
        db = await getDatabase();
        console.log('[Seed] Database obtained via fallback');
    }

    try {
        // 1. Seed Partners
        const partners = [
            { id: 'p1', name: 'Socio Gerente', alias: 'Admin', percentage: 50, role: 'Managing Partner', isManaging: 1 },
            { id: 'p2', name: 'Socio Operativo', alias: 'Socio 2', percentage: 50, role: 'Partner', isManaging: 0 },
        ];

        for (const p of partners) {
            await db.runAsync(
                `INSERT OR REPLACE INTO partners (id, name, alias, participation_percentage, role, is_managing_partner) 
         VALUES (?, ?, ?, ?, ?, ?)`,
                [p.id, p.name, p.alias, p.percentage, p.role, p.isManaging]
            );

            // Create associated account
            await db.runAsync(
                `INSERT OR REPLACE INTO partner_accounts (id, partner_id, current_balance) VALUES (?, ?, ?)`,
                [`acc_${p.id}`, p.id, 0]
            );
        }

         // 2. Seed Movement Categories
         const categories = [
             { id: 'cat1', code: 'CIERRE_CAJA', name: 'Cierre de Caja', type: 'CR', desc: 'Ingreso operativo por ventas' },
             { id: 'cat2', code: 'GASTO_OPERATIVO', name: 'Gasto Operativo', type: 'DB', desc: 'Gastos de local' },
             { id: 'cat3', code: 'RETIRO_SOCIO', name: 'Retiro de Socio', type: 'DB', desc: 'Retiro de fondos por socio' },
             { id: 'cat4', code: 'DISTRIBUCION', name: 'Distribución de Utilidades', type: 'DB', desc: 'Reparto trimestral/semestral' },
             { id: 'cat5', code: 'AJUSTE', name: 'Ajuste de Saldo', type: 'BOTH', desc: 'Correcciones administrativas' },
         ];

         console.log('[Seed] Inserting movement categories...');
         for (const c of categories) {
             console.log(`[Seed] Category: ${c.code} (${c.name}) type=${c.type}`);
             await db.runAsync(
                 `INSERT OR REPLACE INTO movement_categories (id, code, name, type, description) VALUES (?, ?, ?, ?, ?)`,
                 [c.id, c.code, c.name, c.type, c.desc]
             );
         }
         console.log('[Seed] Categories inserted.');

        // 3. Seed Business Units
        const units = [
            { id: 'bu1', name: 'MDCDIII', color: '#FF5733', order: 1 },
            { id: 'bu2', name: 'FugaZ', color: '#33FF57', order: 2 },
            { id: 'bu3', name: 'Diburger', color: '#2196F3', order: 3 },
        ];

        for (const u of units) {
            await db.runAsync(
                `INSERT OR REPLACE INTO business_units (id, name, color, display_order) VALUES (?, ?, ?, ?)`,
                [u.id, u.name, u.color, u.order]
            );
        }

        // 4. Seed App Config
        const configs = [
            { id: 'cfg1', key: 'THEME_MODE', value: 'DARK' },
            { id: 'cfg2', key: 'PRIMARY_COLOR', value: '#38ff14' },
            { id: 'cfg3', key: 'DEFAULT_ADMIN_ID', value: 'p1' },
        ];

        for (const cfg of configs) {
            await db.runAsync(
                `INSERT OR REPLACE INTO app_config (id, key, value) VALUES (?, ?, ?)`,
                [cfg.id, cfg.key, cfg.value]
            );
        }

        console.log('Seed data completed');
    } catch (error) {
        console.error('Error seeding data:', error);
        throw error;
    }
};
