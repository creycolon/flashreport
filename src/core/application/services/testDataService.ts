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
            const { error } = await supabase
                .from('cash_movements')
                .delete()
                .neq('id', -1); // Delete all movements safely

            if (error) {
                console.error('[TestData] Error deleting movements:', error);
                throw error;
            }

            console.log('[TestData] Test movements deleted successfully.');
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
            // In a real factory reset, we might want to delete more, 
            // but for now, clearing all movements is the core task.
            const { error } = await supabase
                .from('cash_movements')
                .delete()
                .neq('id', -1);

            if (error) {
                console.error('[TestData] Error deleting all movements:', error);
                throw error;
            }

            console.log('[TestData] All movements deleted successfully.');
            return true;
        } catch (error) {
            console.error('[TestData] Error in factoryReset:', error);
            throw error;
        }
    }
};