import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Input, Button } from '@ui/shared/components';
import { useTheme } from '@ui/shared/theme/ThemeContext';
import { theme } from '@ui/shared/theme';
import { pluralizeSpanish } from '@core/utils/stringUtils';

export interface BusinessUnitOption {
    id: string;
    name: string;
    color: string;
}

export interface MovementsFiltersEnhancedProps {
    businessUnits?: BusinessUnitOption[];
    selectedBu?: string;
    onSelectBu?: (buId: string) => void;
    onSearch?: (query: string) => void;
    onDateFilterChange?: (filter: string) => void;
    onExport?: () => void;
    onFilter?: () => void;
    onReset?: () => void;
    dateFilter?: string;
    searchQuery?: string;
    businessLabel?: string;
}

const dateFilterOptions = [
    { label: 'Hoy', value: '1d' },
    { label: 'Últimos 7 días', value: '7d' },
    { label: 'Últimos 30 días', value: '30d' },
    { label: 'Todo', value: 'all' },
];

export const MovementsFiltersEnhanced: React.FC<MovementsFiltersEnhancedProps> = ({
    businessUnits = [],
    selectedBu = 'all',
    onSelectBu,
    onSearch,
    onDateFilterChange,
    onExport,
    onFilter,
    onReset,
    dateFilter = '7d',
    searchQuery = '',
    businessLabel = 'Local',
}) => {
    const { colors } = useTheme();
    const [localSearch, setLocalSearch] = useState(searchQuery);
    const [selectedDateFilter, setSelectedDateFilter] = useState(dateFilter);
    const [showBuDropdown, setShowBuDropdown] = useState(false);

    React.useEffect(() => {
        setSelectedDateFilter(dateFilter);
    }, [dateFilter]);

    React.useEffect(() => {
        setLocalSearch(searchQuery);
    }, [searchQuery]);

    const handleSearchChange = (text: string) => {
        setLocalSearch(text);
        if (onSearch) {
            onSearch(text);
        }
    };

    const handleDateFilterSelect = (value: string) => {
        setSelectedDateFilter(value);
        if (onDateFilterChange) {
            onDateFilterChange(value);
        }
    };

    const handleReset = () => {
        setLocalSearch('');
        setSelectedDateFilter('7d');
        if (onReset) {
            onReset();
        }
    };

    const getSelectedBuName = () => {
        if (selectedBu === 'all') return `Todos los ${pluralizeSpanish(businessLabel)}`;
        const bu = businessUnits.find(b => b.id === selectedBu);
        return bu ? bu.name : `${businessLabel} no encontrado`;
    };

    const getSelectedBu = () => {
        if (selectedBu === 'all') return null;
        return businessUnits.find(b => b.id === selectedBu);
    };

    const handleSelectBu = (buId: string) => {
        onSelectBu?.(buId);
        setShowBuDropdown(false);
    };

    const getExportButtonText = () => {
        const buName = getSelectedBuName();
        return `Exportar ${buName}`;
    };

    const styles = StyleSheet.create({
        container: {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: theme.spacing.borderRadius.xl,
            padding: theme.spacing.lg,
            marginBottom: theme.spacing.lg,
            overflow: 'visible',
            position: 'relative',
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.md,
        },
        headerLeft: {
            flex: 1,
        },
        title: {
            color: colors.text,
            fontSize: theme.typography.sizes.lg,
            fontWeight: 'bold',
        },
        selectedBuColorDot: {
            width: 12,
            height: 12,
            borderRadius: 6,
        },
        headerRight: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.md,
            overflow: 'visible',
            position: 'relative',
        },
        filtersRow: {
            flexDirection: 'row',
            gap: theme.spacing.md,
            alignItems: 'center',
        },
        searchContainer: {
            flex: 2,
        },
        dateFiltersContainer: {
            flex: 3,
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: theme.spacing.xs,
        },
        dateFilterButton: {
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            borderRadius: theme.spacing.borderRadius.md,
            borderWidth: 1,
            borderColor: colors.border,
        },
        dateFilterButtonActive: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        dateFilterText: {
            fontSize: theme.typography.sizes.xs,
            fontWeight: '600',
        },
        actionsContainer: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'flex-end',
            gap: theme.spacing.sm,
        },
        actionButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.xs,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            borderRadius: theme.spacing.borderRadius.lg,
            borderWidth: 1,
            borderColor: colors.border,
        },
        exportButton: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        filterButton: {
            backgroundColor: colors.surfaceLight,
        },
        resetButton: {
            backgroundColor: colors.surfaceLight,
        },
        icon: {
            marginRight: 0,
        },
        buSelectorRow: {
            marginBottom: theme.spacing.md,
            position: 'relative',
            zIndex: 10000,
            overflow: 'visible',
        },
        buSelectorButton: {
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: theme.spacing.borderRadius.md,
            padding: theme.spacing.md,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        buSelectorText: {
            color: colors.text,
            fontSize: theme.typography.sizes.md,
        },
        buSelectorIcon: {
            marginLeft: theme.spacing.sm,
        },
        dropdownContainer: {
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: theme.spacing.borderRadius.md,
            marginTop: theme.spacing.xs,
            zIndex: 9999,
            maxHeight: 300,
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            ...(Platform.OS === 'web' && {
                overflowY: 'auto',
            }),
        },
        dropdownHeader: {
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.primary + '40',
            backgroundColor: colors.primary + '20',
        },
        dropdownOption: {
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            flexDirection: 'row',
            alignItems: 'center',
        },
        dropdownOptionSelected: {
            backgroundColor: colors.primary + '20',
        },
        dropdownOptionText: {
            flex: 1,
        },
        dropdownOptionColor: {
            width: 10,
            height: 10,
            borderRadius: 5,
            marginRight: 10,
        },
        // Modal styles
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999999,
        },
        modalContent: {
            backgroundColor: colors.surface,
            borderRadius: theme.spacing.borderRadius.xl,
            width: '90%',
            maxWidth: 400,
            maxHeight: '80%',
            overflow: 'hidden',
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: theme.spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        modalScrollView: {
            maxHeight: 400,
        },
        modalOption: {
            paddingVertical: 14,
            paddingHorizontal: theme.spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            flexDirection: 'row',
            alignItems: 'center',
        },
        modalOptionSelected: {
            backgroundColor: colors.primary + '20',
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                        {getSelectedBu() && (
                            <View style={[styles.selectedBuColorDot, { backgroundColor: getSelectedBu()?.color || colors.primary }]} />
                        )}
                        <Typography style={styles.title}>
                            Movimientos Operativos
                        </Typography>
                    </View>
                    {getSelectedBu() && (
                        <Typography variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                            {getSelectedBu()?.name}
                        </Typography>
                    )}
                </View>
                <View style={styles.headerRight}>
                    {/* Business Unit Selector - now using Modal */}
                    <TouchableOpacity
                        style={[styles.actionButton, { paddingHorizontal: theme.spacing.lg }]}
                        onPress={() => setShowBuDropdown(true)}
                    >
                        {getSelectedBu() && (
                            <View style={[styles.dropdownOptionColor, { backgroundColor: getSelectedBu()?.color || colors.primary }]} />
                        )}
                        <Typography style={{ color: colors.text, fontSize: theme.typography.sizes.sm, fontWeight: 'bold' }}>
                            {getSelectedBuName()}
                        </Typography>
                        <Ionicons
                            name="chevron-down"
                            size={16}
                            color={colors.textSecondary}
                            style={{ marginLeft: theme.spacing.xs }}
                        />
                    </TouchableOpacity>

                    {/* Modal for Business Unit Selection */}
                    <Modal
                        visible={showBuDropdown}
                        transparent
                        animationType="fade"
                        onRequestClose={() => setShowBuDropdown(false)}
                    >
                        <TouchableOpacity
                            style={styles.modalOverlay}
                            activeOpacity={1}
                            onPress={() => setShowBuDropdown(false)}
                        >
                            <TouchableOpacity
                                style={styles.modalContent}
                                activeOpacity={1}
                                onPress={(e) => e.stopPropagation()}
                            >
                                <View style={styles.modalHeader}>
                                    <Typography weight="bold" style={{ fontSize: 18 }}>
                                        🏪 Seleccionar {businessLabel}
                                    </Typography>
                                    <TouchableOpacity onPress={() => setShowBuDropdown(false)}>
                                        <Ionicons name="close" size={24} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                </View>
                                <ScrollView style={styles.modalScrollView}>
                                    <TouchableOpacity
                                        style={[styles.modalOption, selectedBu === 'all' && styles.modalOptionSelected]}
                                        onPress={() => {
                                            handleSelectBu('all');
                                            setShowBuDropdown(false);
                                        }}
                                    >
                                        <View style={[styles.dropdownOptionColor, { backgroundColor: colors.primary }]} />
                                        <Typography style={styles.dropdownOptionText} weight={selectedBu === 'all' ? 'bold' : 'regular'}>
                                            Todos los {pluralizeSpanish(businessLabel)}
                                        </Typography>
                                    </TouchableOpacity>
                                    {businessUnits.map(bu => (
                                        <TouchableOpacity
                                            key={bu.id}
                                            style={[styles.modalOption, selectedBu === bu.id && styles.modalOptionSelected]}
                                            onPress={() => {
                                                handleSelectBu(bu.id);
                                                setShowBuDropdown(false);
                                            }}
                                        >
                                            <View style={[styles.dropdownOptionColor, { backgroundColor: bu.color || colors.primary }]} />
                                            <Typography style={styles.dropdownOptionText} weight={selectedBu === bu.id ? 'bold' : 'regular'}>
                                                {bu.name}
                                            </Typography>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </Modal>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.resetButton]}
                        onPress={handleReset}
                    >
                        <Ionicons name="refresh" size={16} color={colors.textSecondary} />
                        {Platform.OS === 'web' && (
                            <Typography style={styles.dateFilterText} color={colors.textSecondary}>
                                Reiniciar
                            </Typography>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.filterButton]}
                        onPress={onFilter}
                    >
                        <Ionicons name="filter" size={16} color={colors.textSecondary} />
                        {Platform.OS === 'web' && (
                            <Typography style={styles.dateFilterText} color={colors.textSecondary}>
                                Filtrar
                            </Typography>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.exportButton]}
                        onPress={onExport}
                    >
                        <Ionicons name="download" size={16} color={colors.cardBackground} />
                        {Platform.OS === 'web' && (
                            <Typography style={styles.dateFilterText} color={colors.cardBackground} weight="bold">
                                {getExportButtonText()}
                            </Typography>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.filtersRow}>
                <View style={styles.searchContainer}>
                    <Input
                        placeholder="Buscar movimientos por descripción, unidad, POS..."
                        value={localSearch}
                        onChangeText={handleSearchChange}

                    />
                </View>
                <View style={styles.dateFiltersContainer}>
                    {dateFilterOptions.map((option) => {
                        const isActive = selectedDateFilter === option.value;
                        return (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.dateFilterButton,
                                    isActive && styles.dateFilterButtonActive,
                                ]}
                                onPress={() => handleDateFilterSelect(option.value)}
                            >
                                <Typography
                                    style={styles.dateFilterText}
                                    color={isActive ? colors.cardBackground : colors.textSecondary}
                                    weight={isActive ? 'bold' : 'regular'}
                                >
                                    {option.label}
                                </Typography>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </View>
    );
};

// Example usage component
export const MovementsFiltersEnhancedExample: React.FC = () => {
    const [businessUnits] = React.useState([
        { id: '1', name: 'Puesto Norte', color: '#38ff14' },
        { id: '2', name: 'Puesto Sur', color: '#2196f3' },
        { id: '3', name: 'Puesto Este', color: '#e91e63' },
    ]);
    const [selectedBu, setSelectedBu] = React.useState('all');

    return (
        <MovementsFiltersEnhanced
            businessUnits={businessUnits}
            selectedBu={selectedBu}
            onSelectBu={setSelectedBu}
            onSearch={(query) => console.log('Search:', query)}
            onDateFilterChange={(filter) => console.log('Date filter:', filter)}
            onExport={() => console.log('Export')}
            onFilter={() => console.log('Filter')}
            onReset={() => {
                setSelectedBu('all');
                console.log('Reset');
            }}
        />
    );
};