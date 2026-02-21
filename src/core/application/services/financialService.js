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
    },

    /**
     * Gets recent movements for activity feed - one per business unit, from the last date with movement
     */
    getRecentMovements: async (limit = 10, dateFilter = null) => {
        console.log('[financialService] getRecentMovements called, limit:', limit, 'dateFilter:', dateFilter);
        const bus = await businessUnitRepository.getAll();
        
        // Get all movements (more to ensure we get last date per BU)
        let data;
        if (dateFilter) {
            data = await cashMovementRepository.listAll(limit * 10, 0, dateFilter, dateFilter);
        } else {
            data = await cashMovementRepository.listAll(limit * 10, 0);
        }
        
        // Group by business unit and get only the last one per unit
        const lastByBusinessUnit = new Map();
        for (const mov of (data || [])) {
            const buId = mov.business_unit_id;
            const movDate = new Date(mov.transaction_date || mov.created_at);
            const existing = lastByBusinessUnit.get(buId);
            if (!existing || movDate > new Date(existing.transaction_date || existing.created_at)) {
                lastByBusinessUnit.set(buId, mov);
            }
        }
        
        // Convert to activity format
        const activities = Array.from(lastByBusinessUnit.values()).map(mov => {
            const bu = bus.find(b => b.id === mov.business_unit_id);
            const isCredit = mov.type === 'CR';
            const movDate = new Date(mov.transaction_date || mov.created_at);
            
            return {
                id: mov.id,
                title: isCredit ? `Ingreso - ${bu?.name || 'Caja'}` : `Egreso - ${bu?.name || 'Caja'}`,
                description: mov.description || (isCredit ? 'Entrada de dinero' : 'Salida de dinero'),
                amount: isCredit ? `+$${parseFloat(mov.amount).toLocaleString('es-AR')}` : `-$${parseFloat(mov.amount).toLocaleString('es-AR')}`,
                amountType: isCredit ? 'positive' : 'negative',
                time: movDate.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' }),
                icon: isCredit ? 'trending-up' : 'trending-down',
                type: isCredit ? 'revenue' : 'expense',
                businessUnitColor: bu?.color || null,
            };
        });
        
        // Sort by date descending and limit
        activities.sort((a, b) => {
            const dateA = new Date(a.time.split('/').reverse().join('-'));
            const dateB = new Date(b.time.split('/').reverse().join('-'));
            return dateB.getTime() - dateA.getTime();
        });
        
        console.log('[financialService] returning activities (one per BU):', activities.length);
        return activities.slice(0, limit);
    },

    /**
     * Gets box status (open/closed for today)
     */
    getBoxStatus: async () => {
        console.log('[financialService] getBoxStatus called');
        const bus = await businessUnitRepository.getAll();
        const today = new Date().toISOString().split('T')[0];
        
        // Get today's movements per business unit
        const data = await cashMovementRepository.listAll(1000, 0, today, today);
        
        // Group by business unit
        const unitsWithMovement = new Set((data || []).map(m => m.business_unit_id));
        
        const open = unitsWithMovement.size;
        const closed = bus.length - open;
        
        console.log('[financialService] box status:', { open, closed, total: bus.length });
        
        return {
            open,
            closed,
            total: bus.length
        };
    },

    /**
     * Gets global metrics for a specific date
     */
    getGlobalMetricsByDate: async (date) => {
        console.log('[financialService] getGlobalMetricsByDate called, date:', date);
        const bus = await businessUnitRepository.getAll();
        
        const globalBalance = await cashMovementRepository.getGlobalBalance(date, date);
        console.log('[financialService] globalBalance for date:', globalBalance);

        const result = {
            totalSales: globalBalance?.total_credits || 0,
            totalTickets: globalBalance?.ticket_count || 0,
            busCount: bus.length
        };
        console.log('[financialService] returning metrics by date:', result);
        return result;
    },

    /**
     * Gets box status for a specific date
     */
    getBoxStatusByDate: async (date) => {
        console.log('[financialService] getBoxStatusByDate called, date:', date);
        const bus = await businessUnitRepository.getAll();
        
        // Get movements for specific date per business unit
        const data = await cashMovementRepository.listAll(1000, 0, date, date);
        
        // Group by business unit
        const unitsWithMovement = new Set((data || []).map(m => m.business_unit_id));
        
        const open = unitsWithMovement.size;
        const closed = bus.length - open;
        
        console.log('[financialService] box status by date:', { open, closed, total: bus.length });
        
        return {
            open,
            closed,
            total: bus.length
        };
    }
};

/**
 * Helper to get relative time string
 */
function getRelativeTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString('es-AR');
}
