# 🚀 Prompts para Integración Web Stitch

## 📋 Instrucciones de Uso

Cada fase tiene prompts específicos que puedes usar con opencode para implementar esa parte del sistema. Copia el prompt completo y ajústalo según sea necesario.

**Referencia clave**: Los archivos stitch están en `stitch_downloads/`. Cada carpeta contiene:
- `*_code.html` - Código HTML/CSS completo
- `*_screenshot.png` - Captura del diseño
- `metadata.json` - Especificaciones y prompt original

---

## 🎨 **Fase 1: Componentes Base Reutilizables** (2-3 días)

### **Prompt 1.1: Crear EnhancedSidebar component**
```
Crea un componente EnhancedSidebar basado en el diseño de `stitch_downloads/Dashboard_Web_Principal/Dashboard_Web_Principal_code.html`.

Requisitos:
1. Analiza el HTML del sidebar (líneas 61-103 del archivo)
2. Crea un componente React Native en `src/ui/layouts/EnhancedSidebar.tsx`
3. Items del sidebar:
   - Dashboard (icono: stats-chart, activo por defecto)
   - Movimientos (icono: list)
   - Gestión (icono: database) - para futuros CRUDs
   - Informes (icono: analytics)
   - Configuración (icono: settings)
4. Características:
   - Active state con background rgba(56, 255, 20, 0.15) y borde izquierdo verde
   - Hover states para web (Platform.OS === 'web')
   - Transiciones suaves
   - Botón "Nuevo Movimiento" al final (como en línea 94-97)
5. Estilos:
   - Usar colors del ThemeContext (coincidir con stitch: #1a2e16 para surface-dark)
   - Border radius: 12px para items, 16px para contenedor
   - Padding: 16px items, 24px contenedor
6. Props:
   - activeRoute: string
   - onNavigate: (route: string) => void
   - collapsed?: boolean (para versión tablet)

Referencia visual: sidebar del Dashboard_Web_Principal_screenshot.png
```

### **Prompt 1.2: Crear WebHeader component**
```
Crea un componente WebHeader basado en el header de `stitch_downloads/Dashboard_Web_Principal/Dashboard_Web_Principal_code.html` (líneas 107-130).

Requisitos:
1. Analiza la estructura del header (search bar, notifications, user profile)
2. Crea `src/ui/layouts/WebHeader.tsx`
3. Elementos:
   - Search bar con icono de lupa (líneas 109-112)
   - Notification bell con badge (líneas 115-118)
   - User profile con nombre, rol y avatar (líneas 120-128)
4. Características:
   - Search bar funcional (onSearch callback)
   - Sticky header con backdrop blur (línea 107: backdrop-blur-md)
   - Theme toggle integrado (usar existing ThemeContext)
5. Estilos:
   - Height: 64px (h-16)
   - Background: colors.surface con 80% opacity
   - Border bottom: colors.border
   - Search input: rounded-xl, bg-surface-dark
6. Props:
   - onSearch?: (query: string) => void
   - title?: string
   - user?: { name: string, role: string, avatar?: string }

Integrar con nuestro sistema: usar useTheme() para colores
```

### **Prompt 1.3: Crear KPICardEnhanced component**
```
Crea un componente KPICardEnhanced basado en los KPI cards de `stitch_downloads/Dashboard_Web_Principal/Dashboard_Web_Principal_code.html` (líneas 152-195).

Requisitos:
1. Analiza la estructura de los 4 KPI cards (Total Recaudado, Total Tickets, Cajas Abiertas, Diferencia)
2. Crea `src/ui/components/KPICardEnhanced.tsx`
3. Estructura de cada card:
   - Icono superior izquierdo con background primary/10
   - Badge de trend (ej: "+12.5%", "-2.3%", "Activas", "Crítico")
   - Título (ej: "Total Recaudado")
   - Valor grande (ej: "$45,280.00")
   - Subtítulo comparativo (ej: "VS. AYER: $40,210.00")
4. Variantes de badge:
   - Positive: bg-primary/10, text-primary
   - Negative: bg-red-500/10, text-red-500
   - Neutral: bg-gray-500/10, text-gray-500
5. Props:
   - title: string
   - value: string | number
   - icon: Ionicons name
   - trend?: { value: string, type: 'positive' | 'negative' | 'neutral' }
   - subtitle?: string
   - variant?: 'default' | 'warning' | 'danger'
6. Estilos:
   - Card: bg-surface-dark, border border-border-dark, rounded-2xl (16px)
   - Hover: border-primary/50 (web only)
   - Padding: 24px (p-6)
   - Transiciones suaves

Referencia: KPI cards en Dashboard_Web_Principal_screenshot.png
```

### **Prompt 1.4: Crear DataTableWeb component**
```
Crea un componente DataTableWeb basado en la tabla de `stitch_downloads/Movimientos_Operativos_Web/Movimientos_Operativos_Web_code.html`.

Requisitos:
1. Analiza la estructura tabular del archivo HTML
2. Crea `src/ui/components/DataTableWeb.tsx`
3. Características clave:
   - Traffic light indicators para columnas de saldo/monto
     * Verde neón (#38ff14) para valores positivos
     * Rojo suave para valores negativos
   - Sorting por columnas (click en header)
   - Hover states para filas
   - Responsive: scroll horizontal en mobile
4. Props:
   - columns: Array<{ key: string, title: string, width?: number, numeric?: boolean }>
   - data: any[]
   - onSort?: (column: string, direction: 'asc' | 'desc') => void
   - onRowClick?: (row: any) => void
5. Estilos:
   - Header: bg-surface-dark, text-slate-400, font-semibold
   - Rows: alternating backgrounds, hover:bg-surface-light
   - Cell padding: 12px vertical, 16px horizontal
   - Border radius: 8px para tabla completa

Traffic light implementation: valor positivo → View con background rgba(56, 255, 20, 0.15)
```

### **Prompt 1.5: Crear FilterPanel component**
```
Crea un componente FilterPanel basado en los filtros de `stitch_downloads/Movimientos_Operativos_Web/Movimientos_Operativos_Web_code.html` e `Informes_y_Auditoria_Web_code.html`.

Requisitos:
1. Analiza las secciones de filtros en ambos archivos
2. Crea `src/ui/components/FilterPanel.tsx`
3. Tipos de filtros a soportar:
   - Selector simple (Empresa, Unidad de Negocio, Punto de Venta)
   - Date picker (rango o fecha única)
   - Search input
   - Toggle switches
4. Componentes:
   - FilterRow: contenedor horizontal para múltiples filtros
   - FilterItem: item individual con label y control
   - Action buttons: "Aplicar", "Limpiar", "Exportar"
5. Props:
   - filters: FilterConfig[]
   - values: Record<string, any>
   - onChange: (key: string, value: any) => void
   - onApply: () => void
   - onReset: () => void
6. Estilos:
   - Container: bg-surface-dark, rounded-xl, padding 16px
   - Inputs: bg-background-dark, border border-border-dark, rounded-lg
   - Buttons: primary color para aplicar, secondary para limpiar

Usar componentes existentes (Input, Button) pero con estilos stitch
```

---

## 📊 **Fase 2: Dashboard Profesional** (2-3 días)

### **Prompt 2.1: Integrar EnhancedSidebar y WebHeader en WebLayout**
```
Modifica `src/ui/layouts/WebLayout.tsx` para usar los nuevos componentes:

1. Reemplazar el Sidebar actual por EnhancedSidebar
2. Reemplazar el Header actual por WebHeader
3. Ajustar estilos del layout principal:
   - Sidebar width: 256px (w-64)
   - Main content: ml-64 (margin-left 256px)
   - Header sticky: posición fixed o sticky
4. Pasar props correctamente:
   - activeRoute desde useSegments()
   - onNavigate usando router.navigate
   - User info desde contexto (o mock data por ahora)
5. Asegurar responsive behavior:
   - En width < 1024px, mantener mobile layout
   - En width >= 1024px, mostrar web layout completo

Referencia: Layout completo de Dashboard_Web_Principal_screenshot.png
```

### **Prompt 2.2: Transformar DashboardScreen.tsx con componentes stitch**
```
Transforma `src/ui/screens/DashboardScreen.tsx` en un dashboard profesional estilo stitch:

1. Estructura de layout:
   - Welcome section con título "Panel de Control" y descripción
   - KPI row con 4 KPICardEnhanced components
   - Chart section con gráfico principal
   - Recent activity section
2. KPIs a mostrar (mapear a nuestros datos):
   - Total Recaudado → metrics.totalSales
   - Total Tickets → metrics.totalTickets
   - Cajas Abiertas → metrics.busCount (adaptar)
   - Diferencia de Caja → calcular balance
3. Chart improvements:
   - Agregar tooltips interactivos (web only)
   - Mejorar leyenda (usar diseño stitch)
   - Aumentar altura para desktop
4. Recent activity section:
   - Lista de últimos movimientos
   - Cada item: hora, local, monto, tipo
   - Link a "Ver todos"
5. Filter/Export buttons:
   - Botón "Filtros" (línea 140-143)
   - Botón "Exportar Reporte" (línea 144-147)
6. Responsive:
   - Desktop: grid layout (grid-cols-4 para KPIs)
   - Mobile: mantener diseño actual

Usar datos reales de financialService.getGlobalMetrics()
```

### **Prompt 2.3: Implementar search functionality global**
```
Implementa búsqueda global en el WebHeader:

1. En `src/ui/layouts/WebHeader.tsx`:
   - Hacer el search input controlado
   - Agregar debounce (300ms)
   - Emitir evento onSearch con query
2. Crear `src/application/services/searchService.ts`:
   - Función searchGlobal(query: string): Promise<SearchResults>
   - Buscar en: movimientos, locales, socios
   - Retornar resultados categorizados
3. Crear `src/ui/components/SearchResults.tsx`:
   - Modal/dropdown con resultados
   - Agrupar por tipo (movimientos, locales, socios)
   - Highlight términos de búsqueda
   - Navegación a resultado al hacer click
4. Integrar en WebLayout:
   - Estado para query y resultados
   - Mostrar SearchResults cuando hay query
   - Manejar tecla Escape para cerrar

Referencia: Search bar en Dashboard_Web_Principal_code.html línea 109-112
```

### **Prompt 2.4: Agregar actividad reciente al dashboard**
```
Crea un componente RecentActivity para el dashboard:

1. Crear `src/ui/components/RecentActivity.tsx`
2. Datos a mostrar:
   - Últimos 5-10 movimientos de caja
   - Información: fecha/hora, local, monto, tipo (CR/DB), descripción
   - Status indicator (color por tipo)
3. Diseño basado en stitch:
   - Card container: bg-surface-dark, rounded-2xl
   - Header: "Actividad Reciente" + "Ver todos" link
   - List items: padding, borders, hover states
   - Timestamps relativos ("hace 2 horas")
4. Props:
   - activities: Array<CashMovement>
   - limit?: number
   - onViewAll?: () => void
5. Integrar en DashboardScreen:
   - Fetch últimos movimientos con cashMovementRepository.getRecent()
   - Mostrar después del gráfico
   - Link a pantalla de movimientos

Diseño referencia: Sección de actividad en Dashboard_Web_Principal_screenshot.png
```

---

## 📈 **Fase 3: Movimientos Avanzados** (2-3 días)

### **Prompt 3.1: Transformar MovementsListScreen.tsx con DataTableWeb**
```
Transforma `src/ui/screens/MovementsListScreen.tsx` para usar DataTableWeb:

1. Reemplazar la lista actual por DataTableWeb
2. Columnas a mostrar:
   - Fecha (formato DD/MM)
   - Local (nombre)
   - Tipo (CR/DB con badge de color)
   - Monto (con traffic light indicator)
   - Descripción
   - Acciones (✏️ 🗑)
3. Traffic light indicators:
   - Monto positivo → fondo verde rgba(56, 255, 20, 0.15)
   - Monto negativo → fondo rojo rgba(255, 23, 68, 0.15)
4. Sorting:
   - Por defecto: fecha descendente
   - Click header para alternar asc/desc
5. Filtros avanzados:
   - Integrar FilterPanel component
   - Filtros: local, tipo, categoría, rango de fechas, rango de montos
6. Bulk actions:
   - Checkbox por fila
   - Barra de acciones cuando hay selección
   - Exportar selección, eliminar múltiple

Mantener funcionalidad existente (editar, eliminar) pero con nueva UI
```

### **Prompt 3.2: Implementar filtros avanzados para movimientos**
```
Implementa un sistema de filtros avanzados para movimientos:

1. Crear `src/application/services/filterService.ts`:
   - applyFilters(movements, filters): filteredMovements
   - Tipos de filtro: range (fechas, montos), multi-select, search, boolean
   - Validación de filtros
2. Extender `src/ui/components/FilterPanel.tsx`:
   - Agregar DateRangePicker
   - Agregar RangeSlider para montos
   - Agregar MultiSelect para categorías
3. Integrar en MovementsListScreen:
   - Estado para filtros activos
   - Botón toggle para mostrar/ocultar panel de filtros
   - Contador de resultados filtrados
   - Botón "Limpiar filtros"
4. Persistencia:
   - Guardar filtros en localStorage (web)
   - Restaurar al recargar página
   - Opción de guardar filtros como preset

Referencia: Filtros en Movimientos_Operativos_Web_screenshot.png
```

### **Prompt 3.3: Agregar export functionality a movimientos**
```
Implementa funcionalidad de exportación para movimientos:

1. Crear `src/application/services/exportService.ts`:
   - exportToCSV(data, columns, filename)
   - exportToExcel(data, columns, filename) (usar xlsx library si necesario)
   - exportToPDF(data, columns, filename) (para futuro)
2. Crear `src/ui/components/ExportMenu.tsx`:
   - Dropdown con opciones: CSV, Excel, PDF
   - Opciones: exportar todo, exportar filtrado, exportar selección
   - Configuración: columnas a incluir, formato fechas
3. Integrar en MovementsListScreen:
   - Botón "Exportar" en toolbar
   - Menú con opciones
   - Indicador de progreso durante export
   - Notificación al completar
4. Características:
   - Formatear montos con símbolo de moneda
   - Incluir metadatos (fecha exportación, filtros aplicados)
   - Comprimir en ZIP si múltiples archivos

Referencia: Botón "Exportar Reporte" en Dashboard_Web_Principal
```

---

## 📄 **Fase 4: Reportes y Configuración** (2 días)

### **Prompt 4.1: Mejorar ReportsScreen.tsx con diseño stitch**
```
Transforma `src/ui/screens/ReportsScreen.tsx` con diseño de `stitch_downloads/Informes_y_Auditoria_Web`:

1. Layout basado en Informes_y_Auditoria_Web_code.html:
   - Título "Informes y Auditoría"
   - Panel de filtros completo (Empresa, Unidad, Punto, Date Range)
   - Vista previa de datos en tabla
   - Botones de acción: "Generar PDF", "Exportar Excel"
2. Componentes a integrar:
   - FilterPanel avanzado con date range picker
   - DataTableWeb para vista previa
   - ExportMenu con opciones PDF/Excel
3. Report types grid:
   - Crear grid de cards tipo reporte
   - Cada card: icono, título, descripción, acción
   - Tipos: Ventas diarias/semanales, Distribución socios, Performance locales, Flujo de caja
4. Vista previa en tiempo real:
   - Actualizar vista previa al cambiar filtros
   - Mostrar resumen KPI (total, promedio, etc.)
   - Opción de previsualizar antes de exportar
5. Integrar con reportService existente

Diseño referencia: Informes_y_Auditoria_Web_screenshot.png
```

### **Prompt 4.2: Mejorar SettingsScreen.tsx con configuración visual**
```
Transforma `src/ui/screens/SettingsScreen.tsx` con diseño de `stitch_downloads/Configuracion_y_Parametros_Web`:

1. Layout basado en Configuracion_y_Parametros_Web_code.html:
   - Sección "Ajustes de UI" con toggle Dark/Light mode
   - Sección "Gestión de Socio Administrador" con card visual
   - Sección "Herramientas de Simulación" con botones y confirmaciones
   - Sección "Reglas de Negocio" con inputs configurables
2. Componentes nuevos:
   - ThemeToggle: switch visual para dark/light/auto
   - AdminPartnerCard: card con info de socio gerente + botón cambiar
   - ConfirmationModal: para operaciones destructivas
   - BusinessRuleInput: para reglas configurables
3. Integrar funcionalidad existente:
   - Mantener cambio de socio gerente
   - Mantener generación de datos de prueba
   - Mantener reset de datos
4. Nuevas features:
   - Toggle theme directamente en UI (no solo sistema)
   - Configurar días máximos para carga hacia atrás
   - Toggle para obligatoriedad de motivos en correcciones

Diseño referencia: Configuracion_y_Parametros_Web_screenshot.png
```

### **Prompt 4.3: Implementar confirmaciones para operaciones críticas**
```
Implementa un sistema de confirmación visual para operaciones críticas:

1. Crear `src/ui/components/ConfirmationModal.tsx`:
   - Modal con backdrop oscuro
   - Icono de advertencia (⚠️)
   - Título y mensaje personalizables
   - Botones: "Cancelar", "Confirmar"
   - Checkbox "No volver a mostrar" (opcional)
2. Operaciones a proteger:
   - Eliminar movimiento
   - Cambiar socio gerente
   - Generar datos de prueba
   - Borrar todos los movimientos
   - Reset total del sistema
3. Integrar en componentes existentes:
   - ManagePartnerModal: agregar confirmación al cambiar socio
   - SettingsScreen: confirmación para generación/borrado de datos
   - MovementsListScreen: confirmación para eliminar movimiento
4. Persistencia de preferencias:
   - Guardar en AsyncStorage/localStorage
   - Respeta checkbox "No volver a mostrar"

Estilo: Modal profesional con colores stitch, animación de entrada
```

---

## ✨ **Fase 5: Polish y Optimización** (1-2 días)

### **Prompt 5.1: Implementar hover states y transiciones**
```
Implementa hover states y transiciones para web:

1. Crear `src/ui/hooks/useWebStyles.ts`:
   - Hook que retorna styles condicionales para web
   - Funciones: hoverStyle(), focusStyle(), activeStyle()
   - Soporte para pseudo-classes (:hover, :focus, :active)
2. Aplicar a componentes clave:
   - EnhancedSidebar items: hover:bg-surface-light
   - KPICardEnhanced: hover:border-primary/50
   - DataTableWeb rows: hover:bg-surface-light
   - Buttons: hover:opacity-90, active:scale-95
3. Transiciones CSS:
   - transition-all duration-200 ease-in-out
   - Implementar con Animated API o CSS transitions (web)
4. Conditional rendering:
   - Solo aplicar en Platform.OS === 'web'
   - Fallback a activeOpacity en mobile

Referencia: Clases Tailwind en stitch (hover:, transition-all, etc.)
```

### **Prompt 5.2: Optimizar performance para web**
```
Optimiza performance de la aplicación web:

1. Virtual scrolling para listas largas:
   - Implementar VirtualizedList para DataTableWeb
   - Lazy loading para movimientos (paginación infinita)
   - Memoización de componentes con React.memo
2. Code splitting:
   - Separar componentes pesados (charts, tables)
   - Lazy loading de pantallas no frecuentes
3. Optimizar re-renders:
   - Usar useMemo para cálculos costosos
   - useCallback para event handlers
   - Context optimizado (separar ThemeContext si necesario)
4. Bundle optimization:
   - Analizar bundle size con source-map-explorer
   - Tree-shaking de librerías no usadas
   - Compresión de assets

Herramientas: React DevTools Profiler, Lighthouse audit
```

### **Prompt 5.3: Testing cross-browser y responsive**
```
Realiza testing cross-browser y ajustes responsive:

1. Testing en navegadores:
   - Chrome (latest)
   - Firefox (latest)
   - Safari (simulado)
   - Edge (Chromium)
2. Verificar:
   - CSS compatibility (flexbox, grid)
   - JavaScript features (ES6+)
   - Touch events vs mouse events
3. Responsive breakpoints:
   - < 768px: mobile (bottom tabs)
   - 768px - 1024px: tablet (sidebar collapsed)
   - > 1024px: desktop (full web layout)
4. Ajustes específicos:
   - Font rendering differences
   - Scrollbar styling
   - Input appearances
   - Modal positioning

Usar Chrome DevTools device toolbar para testing responsive
```

### **Prompt 5.4: Documentar sistema de componentes stitch**
```
Crea documentación para el sistema de componentes stitch:

1. Crear `src/ui/stitch/README.md`:
   - Overview del sistema de diseño stitch
   - Guía de uso de componentes
   - Ejemplos de código
2. Component documentation:
   - EnhancedSidebar: props, usage, examples
   - WebHeader: features, integration
   - KPICardEnhanced: variants, props
   - DataTableWeb: columns, sorting, traffic lights
3. Theme integration:
   - Cómo extender el ThemeContext
   - Customización de colores
   - Adición de nuevas propiedades
4. Best practices:
   - When to use stitch vs native components
   - Performance considerations
   - Accessibility guidelines

Incluir screenshots de componentes en acción
```

---

## 🔧 **Consideraciones Técnicas Generales**

### **Tailwind a StyleSheet Conversion Guide**
```
Para convertir clases Tailwind a StyleSheet:

1. Spacing:
   - p-6 → padding: 24px (1rem = 16px, 1.5rem = 24px)
   - m-4 → margin: 16px
   - gap-6 → gap: 24px

2. Colors:
   - bg-surface-dark → backgroundColor: colors.surface
   - text-primary → color: colors.primary
   - border-border-dark → borderColor: colors.border

3. Border Radius:
   - rounded-xl → borderRadius: 12px
   - rounded-2xl → borderRadius: 16px
   - rounded-full → borderRadius: 9999px

4. Flexbox/Grid:
   - flex items-center → alignItems: 'center'
   - justify-between → justifyContent: 'space-between'
   - grid-cols-4 → flexDirection: 'row', flexWrap: 'wrap', width: '25%'

Usar Platform.select para diferencias web/mobile
```

### **Icon Mapping Reference**
```
Material Symbols → Ionicons mapping:

- payments → card
- confirmation_number → ticket
- point_of_sale → business
- balance → scale
- search → search
- dashboard → stats-chart
- receipt_long → list
- database → server
- analytics → analytics
- settings → settings-outline
- add_circle → add-circle
- notifications → notifications-outline
- help → help-circle
- filter_list → filter
- download → download

Para iconos no existentes, usar el más similar o añadir a Ionicons
```

### **Performance Tips**
```
1. Virtualize long lists: Use FlashList or VirtualizedList
2. Memoize expensive components: React.memo() with custom comparison
3. Lazy load heavy components: React.lazy() + Suspense
4. Debounce search inputs: 300ms delay
5. Optimize images: WebP format, proper sizing
6. Minimize re-renders: Use React.memo, useMemo, useCallback
7. Code splitting: Separate vendor chunks, lazy load routes
```

---

## 🚨 **Solución de Problemas Comunes**

### **Problema: Hover states no funcionan en web**
```
Solución: Asegurar que Platform.OS === 'web' check y usar pseudo-classes:

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    ...(Platform.OS === 'web' && {
      ':hover': {
        backgroundColor: colors.primary + 'CC',
      },
      ':active': {
        transform: 'scale(0.98)',
      },
    }),
  },
});
```

### **Problema: Grid layout no se comporta como Tailwind**
```
Solución: Implementar con flexbox:

// grid-cols-4 equivalente
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  item: {
    width: '25%', // 4 columns
    padding: 8,
  },
});

// Responsive: usar useWindowDimensions()
const { width } = useWindowDimensions();
const columns = width > 1024 ? 4 : width > 768 ? 2 : 1;
```

### **Problema: Traffic lights indicators no se ven bien**
```
Solución: Implementar con View condicional:

const AmountCell = ({ value }) => {
  const isPositive = value >= 0;
  return (
    <View style={[
      styles.cell,
      isPositive ? styles.positive : styles.negative
    ]}>
      <Typography>{formatCurrency(value)}</Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  positive: {
    backgroundColor: 'rgba(56, 255, 20, 0.15)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  negative: {
    backgroundColor: 'rgba(255, 23, 68, 0.15)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
```

---

**Estos prompts proporcionan una guía completa para implementar la integración web stitch fase por fase. Comienza con Fase 1 y avanza secuencialmente.**