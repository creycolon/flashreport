/**
 * Utility to format numbers with regional standards
 * Thousands separator: .
 * Decimal separator: ,
 */
export const formatNumber = (num: number, decimals: number = 0): string => {
    if (num === null || num === undefined || isNaN(num)) return '0';

    // Fix decimals and split
    const parts = num.toFixed(decimals).split('.');

    // Add dots for thousands
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // Join with comma for decimals
    return parts.join(',');
};

/**
 * Utility to format currency (Pesos)
 * Format: $ 1.234
 */
export const formatCurrency = (amount: number, showDecimals: boolean = false): string => {
    return `$ ${formatNumber(amount, showDecimals ? 2 : 0)}`;
};

/**
 * Utility to format dates consistently (DD/MM/YYYY)
 */
export const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
};
