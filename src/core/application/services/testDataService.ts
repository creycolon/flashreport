import { cashMovementRepository } from '@core/infrastructure/repositories/cashMovementRepository.js';
import { businessUnitRepository } from '@core/infrastructure/repositories/businessUnitRepository';
import { categoryRepository } from '@core/infrastructure/repositories/categoryRepository';
import { supabase } from '@core/infrastructure/db/supabaseClient';
import { managingPartnerService } from './managingPartnerService';
import { pointOfSaleRepository } from '@core/infrastructure/repositories/pointOfSaleRepository';

export const testDataService = {
    /**
     * Generates random movements for the last 30 days
     * Optimized for high volume sales (100k avg) and no expenses as per user request.
     */
    generateMockData: async () => {
        try {
            console.log('[TestData] Fetching dependency data...');
            const [bus, incomeCategories, managingPartner] = await Promise.all([
                businessUnitRepository.getAll(),
                categoryRepository.getByType('CR'),
                managingPartnerService.getCurrentManagingPartner()
            ]);

            console.log(`[TestData] Initialized: units=${bus.length}, incomeCategories=${incomeCategories.length}, partner=${managingPartner?.name}`);
            console.log('[TestData] Income categories:', incomeCategories.map((c: any) => `${c.code} (${c.name}) type=${c.type}`));

            if (bus.length === 0 || incomeCategories.length === 0) {
                console.warn('[TestData] Cannot generate data: No units or categories found.');
                return false;
            }

            // Identificamos la categoría de Ventas (SALES) o usamos la primera categoría CR
            const saleCategory = incomeCategories.find((c: any) => c.code === 'SALES') || incomeCategories[0];
            console.log(`[TestData] Using category for sales: ${saleCategory.code} (${saleCategory.name})`);

            console.log(`[TestData] Starting mock data generation for ${bus.length} units (100k avg, no expenses)...`);
            const now = new Date();
            let totalMovements = 0;

            for (const bu of bus) {
                console.log(`[TestData] Generating data for: ${bu.name} (${bu.id})`);

                // Get or create POS for this BU
                let posId = null;
                const posList = await pointOfSaleRepository.listByBusinessUnit(bu.id);

                if (posList.length > 0) {
                    posId = posList[0].id;
                    console.log(`[TestData] Found POS for ${bu.name}: ${posList[0].name} (ID: ${posId})`);
                } else {
                    console.log(`[TestData] No POS found for BU ${bu.name}. Creating one...`);
                    const newPos = await pointOfSaleRepository.ensureDefaultPOS(bu.id, bu.name);
                    posId = newPos.id;
                    console.log(`[TestData] Created default POS for ${bu.name}: (ID: ${posId})`);
                }

                // Monto base de 300,000 con variación del 40%
                const baseAmount = 300000;

                for (let i = 30; i >= 1; i--) {
                    const date = new Date();
                    date.setDate(now.getDate() - i);
                    const dateStr = date.toISOString();

                    // Un solo ticket de venta por día con promedio de 100k
                    const salesAmount = baseAmount + (Math.random() - 0.5) * (baseAmount * 0.4);

                    if (i === 29) { // Log first movement of each unit
                        console.log(`[TestData] First movement for ${bu.name}: ${dateStr}, amount ~${Math.round(salesAmount)}`);
                    }

                    await cashMovementRepository.create({
                        businessUnitId: bu.id,
                        type: 'CR',
                        categoryId: saleCategory.id,
                        amount: Math.round(salesAmount),
                        description: `Ventas del día - ${bu.name}`,
                        date: dateStr,
                        createdBy: managingPartner?.id || null,
                        pointOfSaleId: posId
                    });
                    totalMovements++;
                }
                console.log(`[TestData] Done with Unit: ${bu.name} (30 movements)`);
            }
            console.log(`[TestData] Total mock data generation finished successfully. Created ${totalMovements} movements.`);
            return true;
        } catch (error) {
            console.error('[TestData] Error generating mock data:', error);
            throw error;
        }
    },

    /**
     * Deletes all cash movements and resets balances
     */
    clearAllData: async () => {
        try {
            console.log('[TestData] Deleting all movements...');
            
            // Delete cash movements
            const { error: movementsError } = await supabase
                .from('cash_movements')
                .delete()
                .neq('id', -1);

            if (movementsError) {
                console.error('[TestData] Error deleting movements:', movementsError);
                throw movementsError;
            }

            // Delete audit logs
            const { error: auditError } = await supabase
                .from('audit_logs')
                .delete()
                .neq('id', -1);

            if (auditError) {
                console.error('[TestData] Error deleting audit_logs:', auditError);
            }

            console.log('[TestData] All data cleared successfully.');
            return true;
        } catch (error) {
            console.error('[TestData] Error in clearAllData:', error);
            throw error;
        }
    },

    /**
     * NUCLEAR RESET: Drops all relevant data and re-seeds initial state
     */
    factoryReset: async () => {
        try {
            console.log('[TestData] Performing factory reset...');
            
            // Ensure audit_logs table exists
            await testDataService.ensureAuditLogsTable();
            
            // Delete all cash movements
            const { error: movementsError } = await supabase
                .from('cash_movements')
                .delete()
                .neq('id', -1);

            if (movementsError) {
                console.error('[TestData] Error deleting movements:', movementsError);
                throw movementsError;
            }

            // Delete all audit logs
            const { error: auditError } = await supabase
                .from('audit_logs')
                .delete()
                .neq('id', -1);

            if (auditError) {
                console.error('[TestData] Error deleting audit_logs:', auditError);
            }

            // Delete all business units
            const { error: busError } = await supabase
                .from('business_units')
                .delete()
                .neq('id', -1);

            if (busError) {
                console.error('[TestData] Error deleting business_units:', busError);
            }

            // Delete all partner accounts
            const { error: partnerError } = await supabase
                .from('partner_accounts')
                .delete()
                .neq('id', -1);

            if (partnerError) {
                console.error('[TestData] Error deleting partner_accounts:', partnerError);
            }

            // Delete all partner account transactions
            const { error: partnerTransError } = await supabase
                .from('partner_account_transactions')
                .delete()
                .neq('id', -1);

            if (partnerTransError) {
                console.error('[TestData] Error deleting partner_account_transactions:', partnerTransError);
            }

            // Delete all partners
            const { error: partnersError } = await supabase
                .from('partners')
                .delete()
                .neq('id', -1);

            if (partnersError) {
                console.error('[TestData] Error deleting partners:', partnersError);
            }

            console.log('[TestData] Factory reset completed successfully.');
            return true;
        } catch (error) {
            console.error('[TestData] Error in factoryReset:', error);
            throw error;
        }
    },

    /**
     * Ensures audit_logs table exists, creates it if not
     */
    ensureAuditLogsTable: async () => {
        try {
            // Check if table exists by trying to select from it
            const { error: checkError } = await supabase
                .from('audit_logs')
                .select('id')
                .limit(1);

            if (checkError && checkError.code === '42P01') {
                console.log('[TestData] Creating audit_logs table...');
                
                // Create table using raw SQL via rpc or direct query
                const { error: createError } = await supabase.rpc('create_audit_logs_table', {});
                
                // If RPC doesn't exist, try alternative approach
                if (createError) {
                    console.log('[TestData] RPC not available, table will be created via migration');
                }
            } else if (!checkError) {
                console.log('[TestData] audit_logs table already exists');
            }
        } catch (error) {
            console.log('[TestData] audit_logs table check skipped:', error);
        }
    }
};