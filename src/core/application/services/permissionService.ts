export const hasPermission = (partner: any, requiredAction?: string): boolean => {
    if (!partner) return false;
    
    // Admin tiene acceso TOTAL
    if (partner.role === 'admin') return true;
    
    // Managing Partner tiene acceso completo
    if (partner.is_managing_partner) return true;
    
    // Rol "carga" - solo puede editar perfil y cargar movimientos
    if (partner.role === 'carga') {
        if (requiredAction === 'edit_profile') return true;
        if (requiredAction === 'create_movement') return true;
        if (requiredAction === 'view_own_movements') return true;
        if (requiredAction === 'view_profile') return true;
        return false;
    }
    
    // Por defecto, cualquier partner activo puede ver sus datos
    if (partner.is_active) return true;
    
    return false;
};

export const isAdmin = (partner: any): boolean => {
    return partner?.role === 'admin';
};

export const isCarga = (partner: any): boolean => {
    return partner?.role === 'carga';
};

export const canEditProfile = (partner: any): boolean => {
    return hasPermission(partner, 'edit_profile');
};

export const canCreateMovement = (partner: any): boolean => {
    return hasPermission(partner, 'create_movement');
};

export const canViewAllPartners = (partner: any): boolean => {
    if (!partner) return false;
    if (partner.role === 'admin') return true;
    if (partner.is_managing_partner) return true;
    return false;
};

export const canViewAllMovements = (partner: any): boolean => {
    if (!partner) return false;
    if (partner.role === 'admin') return true;
    if (partner.is_managing_partner) return true;
    return false;
};

export const canManageBusinessUnits = (partner: any): boolean => {
    if (!partner) return false;
    if (partner.role === 'admin') return true;
    if (partner.is_managing_partner) return true;
    return false;
};
