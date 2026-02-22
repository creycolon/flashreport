import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { SCHEMA_SQL } from './schema';

const DATABASE_NAME = 'flash_report.db';
const STORAGE_KEY = 'flash_report_web_db';
let dbInstance = null;
let isInitialized = false;

// Datos de fábrica que NUNCA deben faltar
const defaultStorage = {
  partners: [
    { id: 'p1', name: 'Administrador Principal', alias: 'Admin', participation_percentage: 50, role: 'Managing Partner', is_managing_partner: 1, is_active: 1 },
    { id: 'p2', name: 'Socio Operativo', alias: 'Socio 2', participation_percentage: 50, role: 'Partner', is_managing_partner: 0, is_active: 1 },
  ],
  partner_accounts: [
    { id: 'acc_p1', partner_id: 'p1', current_balance: 0 },
    { id: 'acc_p2', partner_id: 'p2', current_balance: 0 },
  ],
  business_units: [
    { id: 'bu1', name: 'MCMXII', color: '#FF5733', is_active: 1, display_order: 1 },
    { id: 'bu2', name: 'FugaZ', color: '#33FF57', is_active: 1, display_order: 2 },
    { id: 'bu3', name: 'Diburger', color: '#2196F3', is_active: 1, display_order: 3 }
  ],
  movement_categories: [
    { id: 'cat1', name: 'Ventas', type: 'CR' },
    { id: 'cat2', name: 'Gastos Generales', type: 'DB' },
    { id: 'cat3', name: 'Retiros', type: 'DB' }
  ],
  points_of_sale: [
    { id: 1, business_unit_id: 'bu1', name: 'MCMXII POS 1', fiscal_id: 'Identificacion Fiscal', is_active: 1 },
    { id: 2, business_unit_id: 'bu2', name: 'FugaZ POS 1', fiscal_id: 'Identificacion Fiscal', is_active: 1 },
    { id: 3, business_unit_id: 'bu3', name: 'Diburger POS 1', fiscal_id: 'Identificacion Fiscal', is_active: 1 },
  ],
  cash_movements: [],
  partner_account_transactions: [],
  app_config: [
    { id: 'cfg1', key: 'chart_dynamic_zoom', value: 'true' },
    { id: 'cfg2', key: 'default_days_chart', value: '7' },
    { id: 'cfg3', key: 'default_mode', value: 'dark' },
    { id: 'cfg4', key: 'default_manager', value: '1' },
    { id: 'cfg5', key: 'default_business', value: 'Negocio' },
  ],
};

let memoryStorage = { ...defaultStorage };

const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Fusionamos con los defaults para asegurar que no falten tablas clave
      memoryStorage = { ...defaultStorage, ...parsed };
      // Si después de cargar, las listas clave están vacías, las repoblamos
      if (!memoryStorage.business_units || memoryStorage.business_units.length === 0) {
        memoryStorage.business_units = [...defaultStorage.business_units];
      }
      if (!memoryStorage.partners || memoryStorage.partners.length === 0) {
        memoryStorage.partners = [...defaultStorage.partners];
      }
      console.log("[DB Mock] Datos cargados:", memoryStorage.business_units.length, "unidades.");
    }
  } catch (e) {
    console.error("[DB Mock] Error cargando storage:", e);
  }
};

const saveToStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryStorage));
  } catch (e) { }
};

const createWebMock = () => {
  loadFromStorage();

  return {
    execAsync: async (sql) => true,
    runAsync: async (sql, params = []) => {
      console.log(`[DB Mock] runAsync: ${sql}`, params);

      // Generic DELETE handling
      if (sql.includes('DELETE FROM')) {
        const tableMatch = sql.match(/DELETE FROM (\w+)/);
        if (tableMatch) {
          const table = tableMatch[1];
          if (memoryStorage[table]) {
            memoryStorage[table] = [];
            if (table === 'cash_movements') {
              // Special case: reset balances if movements are cleared
              memoryStorage.partner_accounts?.forEach(a => a.current_balance = 0);
            }
          }
        }
      }
      // Generic INSERT handling (heuristic)
      else if (sql.includes('INSERT INTO')) {
        const tableMatch = sql.match(/INSERT INTO (\w+)/);
        if (tableMatch) {
          const table = tableMatch[1];
          // We need to know the schema to map params to object keys accurately
          // but for simplicity we'll handle known tables or push a generic object

          if (table === 'cash_movements') {
            memoryStorage.cash_movements.push({
              id: params[0], business_unit_id: params[1], transaction_date: params[2],
              type: params[3], category_id: params[4], amount: Number(params[5]) || 0,
              description: params[6], reference_id: params[7], partner_account_id: params[8],
              created_by: params[9], sequence_number: params[10], point_of_sale_id: params[11], is_active: 1
            });
          } else if (table === 'business_units') {
            // Check if exists (INSERT OR IGNORE simulation)
            if (!memoryStorage.business_units.find(x => x.id === params[0])) {
              memoryStorage.business_units.push({
                id: params[0], name: params[1], color: params[2], display_order: params[3], is_active: 1
              });
            }
          } else if (table === 'movement_categories') {
            if (!memoryStorage.movement_categories.find(x => x.id === params[0])) {
              memoryStorage.movement_categories.push({
                id: params[0], code: params[1], name: params[2], type: params[3], description: params[4]
              });
            }
          } else if (table === 'partners') {
            if (!memoryStorage.partners.find(x => x.id === params[0])) {
              memoryStorage.partners.push({
                id: params[0], name: params[1], alias: params[2], participation_percentage: params[3],
                role: params[4], is_managing_partner: params[5], is_active: 1
              });
            }
          } else if (table === 'partner_accounts') {
            if (!memoryStorage.partner_accounts.find(x => x.id === params[0])) {
              memoryStorage.partner_accounts.push({
                id: params[0], partner_id: params[1], current_balance: params[2] || 0
              });
            }
          } else if (table === 'app_config') {
            const existing = memoryStorage.app_config.find(x => x.key === params[1]);
            if (existing) {
              existing.value = params[2];
            } else {
              memoryStorage.app_config.push({ id: params[0], key: params[1], value: params[2] });
            }
          }
        }
      }
      // UPDATE handling
      else if (sql.includes('UPDATE cash_movements SET is_active = 0')) {
        const id = params[params.length - 1]; // Usually the last param for WHERE id = ?
        const m = memoryStorage.cash_movements.find(x => x.id === id);
        if (m) m.is_active = 0;
      }
      else if (sql.includes('FROM points_of_sale')) {
        // Used for listByBusinessUnit in mock
        const buId = params[0];
        return memoryStorage.points_of_sale.filter(p => p.business_unit_id === buId && p.is_active === 1);
      }

      saveToStorage();
      return { lastInsertRowId: Date.now(), changes: 1 };
    },
    getFirstAsync: async (sql, params = []) => {
      if (sql.includes('SUM(CASE')) {
        // ... (existing logic is okay)
        const buId = sql.includes('business_unit_id = ?') ? params[0] : null;
        let relevant = memoryStorage.cash_movements.filter(m => m.is_active === 1);
        if (buId) relevant = relevant.filter(m => m.business_unit_id === buId);

        const dateParams = params.filter(p => typeof p === 'string' && p.match(/^\d{4}-\d{2}-\d{2}/));
        if (dateParams.length > 0) {
          relevant = relevant.filter(m => m.transaction_date.split('T')[0] >= dateParams[0]);
          if (dateParams.length > 1) relevant = relevant.filter(m => m.transaction_date.split('T')[0] <= dateParams[1]);
        }
        return {
          total_credits: relevant.reduce((sum, m) => m.type === 'CR' ? sum + m.amount : sum, 0),
          total_debits: relevant.reduce((sum, m) => m.type === 'DB' ? sum + m.amount : sum, 0),
          ticket_count: relevant.filter(m => m.type === 'CR').length
        };
      }
      if (sql.includes('FROM business_units WHERE id = ?')) return memoryStorage.business_units.find(bu => bu.id === params[0]);
      if (sql.includes('MAX(sequence_number)')) {
        const buId = params[0];
        const relevant = memoryStorage.cash_movements.filter(m => m.business_unit_id === buId);
        const maxSeq = relevant.reduce((max, m) => Math.max(max, m.sequence_number || 0), 0);
        return { lastSeq: maxSeq };
      }
      if (sql.includes('FROM app_config')) {
        const config = memoryStorage.app_config.find(c => c.key === params[0]);
        return config ? { value: config.value } : null;
      }
      return null;
    },
    getAllAsync: async (sql, params = []) => {
      if (sql.includes('FROM business_units')) {
        let list = memoryStorage.business_units;
        if (sql.includes('is_active = 1')) list = list.filter(bu => bu.is_active === 1);
        return [...list].sort((a, b) => a.display_order - b.display_order);
      }
      if (sql.includes('FROM movement_categories')) {
        if (sql.includes('type = ?')) {
          return memoryStorage.movement_categories.filter(c => c.type === params[0] || c.type === 'BOTH');
        }
        return memoryStorage.movement_categories;
      }
      if (sql.includes('FROM cash_movements')) {
        let relevant = memoryStorage.cash_movements.filter(m => m.is_active === 1);
        const buId = sql.includes('business_unit_id = ?') ? params[0] : null;
        if (buId) relevant = relevant.filter(m => m.business_unit_id === buId);

        const dateParams = params.filter(p => typeof p === 'string' && p.match(/^\d{4}-\d{2}-\d{2}/));
        if (dateParams.length > 0) {
          relevant = relevant.filter(m => m.transaction_date.split('T')[0] >= dateParams[0]);
          if (dateParams.length > 1) relevant = relevant.filter(m => m.transaction_date.split('T')[0] <= dateParams[1]);
        }

        return relevant.map(m => {
          const bu = memoryStorage.business_units.find(b => b.id === m.business_unit_id);
          const cat = memoryStorage.movement_categories.find(c => c.id === m.category_id);
          return { ...m, bu_name: bu?.name, bu_color: bu?.color, category_name: cat?.name };
        }).sort((a, b) => b.transaction_date.localeCompare(a.transaction_date) || b.sequence_number - a.sequence_number);
      }
      if (sql.includes('FROM points_of_sale')) {
        const buId = params[0];
        return memoryStorage.points_of_sale.filter(p => p.business_unit_id === buId && p.is_active === 1);
      }
      return [];
    }
  };
};

let dbPromise = null;

export const getDatabase = async () => {
  if (dbPromise) return dbPromise;

  dbPromise = (async () => {
    try {
      console.log('[Database] Opening database...');
      if (Platform.OS === 'web') {
        console.log('[Database] Using web mock');
        return createWebMock();
      }

      const database = await SQLite.openDatabaseAsync(DATABASE_NAME);
      console.log('[Database] Database opened successfully');

      // Ensure schema is initialized (only once)
      if (!isInitialized) {
        console.log('[Database] Initializing schema...');
        try {
          await database.execAsync(SCHEMA_SQL);
          console.log('[Database] Schema executed successfully');
          isInitialized = true;
          console.log('[Database] Schema initialized');

          // Check if initial data needs to be seeded
          try {
            console.log('[Database] Checking if business_units table has data...');
            const countResult = await database.getFirstAsync('SELECT COUNT(*) as count FROM business_units');
            console.log('[Database] Count result:', countResult);
            if (countResult && countResult.count === 0) {
              console.log('[Database] No business units found, seeding initial data...');
              try {
                console.log('[Database] Importing seed module...');
                const { seedInitialData } = await import('./seed');
                console.log('[Database] Seed module imported, calling seedInitialData...');
                await seedInitialData(database);
                console.log('[Database] Initial data seeded');
              } catch (seedError) {
                console.error('[Database] Seed error details:', seedError);
                console.error('[Database] Seed error stack:', seedError.stack);
                throw seedError;
              }
            } else {
              console.log(`[Database] business_units already has ${countResult?.count || 0} records`);
            }
          } catch (seedError) {
            console.warn('[Database] Could not seed initial data:', seedError);
            console.warn('[Database] Seed error stack:', seedError.stack);
          }
        } catch (schemaError) {
          console.error('[Database] Error executing schema:', schemaError);
          console.error('[Database] Schema error stack:', schemaError.stack);
          throw schemaError;
        }
      } else {
        console.log('[Database] Schema already initialized');
      }

      return database;
    } catch (error) {
      console.error('[Database] Error in getDatabase:', error);
      console.error('[Database] Error stack:', error.stack);
      dbPromise = null; // Reset on failure so it can retry
      throw error;
    }
  })();

  return dbPromise;
};

export const initDatabase = async (schemaSql) => {
  try {
    console.log('[Database] Initializing database...');
    const database = await getDatabase();
    if (Platform.OS !== 'web') {
      console.log('[Database] Executing schema SQL (mobile)');
      await database.execAsync(schemaSql);
    } else {
      console.log('[Database] Web mock - skipping schema');
    }
    console.log('[Database] Initialization completed');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};
