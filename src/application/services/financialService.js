import { cashMovementRepository } from '../../infrastructure/repositories/cashMovementRepository';
import { partnerRepository } from '../../infrastructure/repositories/partnerRepository';
import { businessUnitRepository } from '../../infrastructure/repositories/businessUnitRepository';

export const financialService = {
    /**
     * Calculates the current balance for a Business Unit
     */
    getBusinessUnitBalance: async (businessUnitId) => {
        return await cashMovementRepository.getBalance(businessUnitId);
    },

    /**
     * Gets global metrics across all Business Units
     */
    /**
     * Gets global metrics across all Business Units
     */
    getGlobalMetrics: async (days = 7) => {
        console.log('[financialService] getGlobalMetrics called, days:', days);
        const bus = await businessUnitRepository.getAll();
        console.log('[financialService] business units:', bus.length, bus);
        // Calculate start date based on days
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const startDateStr = startDate.toISOString().split('T')[0];
        console.log('[financialService] startDate:', startDateStr);

        // Use single query for global balance instead of N queries
        const globalBalance = await cashMovementRepository.getGlobalBalance(startDateStr);
        console.log('[financialService] globalBalance:', globalBalance);

        const result = {
            totalSales: globalBalance?.total_credits || 0,
            totalTickets: globalBalance?.ticket_count || 0,
            busCount: bus.length
        };
        console.log('[financialService] returning metrics:', result);
        return result;
    },

    /**
     * Gets performance data for all Business Units for chart visualization
     */
    getChartData: async (days = 7) => {
        console.log('[financialService] getChartData called, days:', days);
        const bus = await businessUnitRepository.getAll();
        console.log('[financialService] chart business units:', bus.length);
        const series = [];

        // Generate list of expected dates (last N days)
        const dateLabels = [];
        const today = new Date();
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            dateLabels.push(d.toISOString().split('T')[0]);
        }
        console.log('[financialService] dateLabels:', dateLabels);

        for (const bu of bus) {
            const rawData = await cashMovementRepository.getDailySales(bu.id, days);
            console.log(`[financialService] BU ${bu.id} rawData:`, rawData);

            // Map raw data to the complete date list (fill gaps with 0)
            const filledData = dateLabels.map(date => {
                const dayRecord = rawData.find(r => r.day === date);
                return dayRecord ? dayRecord.total : 0;
            });

            series.push({
                id: bu.id,
                name: bu.name,
                color: bu.color,
                data: filledData
            });
        }

        // Format labels based on range
        const todayDay = new Date().getDate(); // Capture today's day number (e.g. 14)

        const labels = dateLabels.map((dateStr, idx) => {
            const [y, m, d] = dateStr.split('-');
            const dateObj = new Date(y, m - 1, d);
            const dayNum = parseInt(d);

            if (days <= 7) {
                // Weekly: Show all days
                const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
                return daysOfWeek[dateObj.getDay()];
            } else if (days <= 31) {
                // Monthly: Show "d" (Day number), but add Month "d MMM" at start, on month change, or at the end
                const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                if (idx === 0 || d === '01' || idx === dateLabels.length - 1) {
                    return `${parseInt(d)} ${months[dateObj.getMonth()]}`;
                }
                return parseInt(d).toString();
            } else {
                // Annual: Sparse Labels
                // Only show label if the day matches today's day number (e.g. 14th)
                // Also ensure the very last label (Today) is shown if it matches logic (it should)
                // Or if it's the very last index? (Let's stick to the day number logic to keep it aligned)
                if (dayNum === todayDay) {
                    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                    return `${d}/${months[dateObj.getMonth()]}`;
                }
                return ''; // Empty string for days that shouldn't have a label
            }
        });

        const result = {
            labels,
            series
        };
        console.log('[financialService] returning chart data:', result);
        return result;
    },

    /**
     * Records a cash withdrawal for a partner.
     * Implements "Balance Allowance" business rule.
     */
    requestWithdrawal: async (partnerId, amount, businessUnitId, description, createdBy) => {
        // 1. Get current partner account
        const account = await partnerRepository.getAccountByPartnerId(partnerId);
        if (!account) throw new Error('Partner account not found');

        // 2. Business Rule: Balance Allowance
        // Partners can withdraw even if balance goes negative. 
        // We calculate the new balance.
        const newBalance = account.current_balance - amount;

        // 3. Update Partner Account
        await partnerRepository.updateBalance(account.id, newBalance);

        // 4. Record Transaction in History
        await partnerRepository.recordTransaction(
            account.id,
            'DB',
            amount,
            'WITHDRAWAL',
            description || 'Retiro de efectivo',
            createdBy
        );

        // 5. Create Cash Movement in Business Unit
        const movement = {
            businessUnitId,
            type: 'DB',
            categoryId: 'cat3', // RETIRO_SOCIO
            amount,
            description: description || `Retiro de socio: ${partnerId}`,
            partnerAccountId: account.id,
            createdBy: createdBy,
            date: new Date().toISOString()
        };

        return await cashMovementRepository.create(movement);
    },

    /**
     * Closes a financial period for a Business Unit.
     * Moves active records to inactive and creates an opening balance.
     */
    closeAccountingPeriod: async (businessUnitId, periodLabel) => {
        // 1. Calculate final balance before closing
        const closingBalance = await cashMovementRepository.getBalance(businessUnitId);

        // 2. Mark all currently active movements as inactive with the period label
        await cashMovementRepository.deactivatePeriod(businessUnitId, periodLabel);

        // 3. Create a new opening movement (CREDIT) for the next period
        const openingMovement = {
            businessUnitId,
            type: 'CR',
            categoryId: 'cat5', // AJUSTE / APERTURA
            amount: closingBalance,
            description: `Saldo inicial - Período post ${periodLabel}`,
            date: new Date().toISOString()
        };

        return await cashMovementRepository.create(openingMovement);
    }
};
