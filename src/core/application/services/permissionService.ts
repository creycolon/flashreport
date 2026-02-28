export const hasPermission = (partner: any, action?: string): boolean => {
    if (!partner) return false;
    
    if (partner.role === 'admin') return true;
    
    if (partner.is_managing_partner) return true;
    
    return false;
};

export const isAdmin = (partner: any): boolean => {
    return partner?.role === 'admin';
};
