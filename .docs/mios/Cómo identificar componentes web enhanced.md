Cómo identificar componentes web-enhanced:
📁 Ubicación
src/ui/web/components/*Enhanced.tsx     # Componentes principales
src/ui/web/layouts/*Enhanced.tsx        # Layouts mejorados
🔍 Patrón de nomenclatura
- Sufijo Enhanced (ej: MovementsFiltersEnhanced, ReportsEnhanced)
- Exportados desde @ui/web/components (ver src/ui/web/components/index.ts)
🎯 Dónde se usan
Los componentes enhanced se activan automáticamente en pantallas web de escritorio:
// Patrón típico en pantallas (ej: ReportsScreen.tsx:148)
const isWebDesktop = Platform.OS === 'web' && windowWidth >= 1024;
if (isWebDesktop) {
    return <ComponenteEnhanced />;  // Versión web mejorada
} else {
    return <ComponenteNativo />;    // Versión móvil/nativa
}
📋 Componentes disponibles
• MovementsFiltersEnhanced    → Filtros de movimientos
• MovementsTableEnhanced      → Tabla de movimientos  
• ReportsEnhanced            → Informes y auditoría
• AddMovementEnhanced        → Formulario añadir movimiento
• BusinessUnitsEnhanced      → Gestión de unidades
• PartnersEnhanced           → Gestión de socios
• SettingsEnhanced           → Configuración
• KPICardEnhanced            → Tarjetas de métricas
• ChartContainerEnhanced     → Gráficos
• ActivityFeedEnhanced       → Actividad reciente
🔧 Cómo verificar uso
# Buscar importaciones de componentes enhanced
grep -r "import.*Enhanced" src/features/ --include="*.tsx"
# Ver qué pantallas usan componentes web
grep -l "Platform.OS === 'web'" src/features/*/*Screen.tsx
# Listar todos los componentes enhanced
find src/ui/web -name "*Enhanced*.tsx" | sort
🎨 Layouts mejorados
- WebLayoutEnhanced: Layout principal para web
- EnhancedSidebar: Barra lateral con navegación
Los componentes enhanced se renderizan solo en web (≥1024px) manteniendo la versión nativa para móvil.
/agents      
Switch agent
/compact     
Compact session
/connect     
Connect provider
/copy        
Copy session transcript
/editor      
▣  Build · deepseek-reasoner · 1m 36s
Open editor
/exit        
Exit the app
Build 
DeepSeek Reasoner
DeepSeek

