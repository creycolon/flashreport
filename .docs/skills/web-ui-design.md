# Diseño Web UI - Flash Report Supabase

## 🎯 Objetivo
Diseñar una experiencia web optimizada para escritorio que mantenga coherencia con la app móvil existente, mejorando usabilidad, accesibilidad y productividad en pantallas grandes.

## 🎨 Sistema de Diseño Web

### **Paleta de Colores (Existente)**
```
Modo Oscuro:
- Primario: #38ff14 (Neon Green)
- Fondo: #0a0a0a
- Superficie: #1a1a1a
- Texto: #ffffff
- Borde: #333333

Modo Claro:
- Primario: #1faa00 (Dark Green)
- Fondo: #f8f9fa
- Superficie: #ffffff
- Texto: #1a1a1a
- Borde: #dadce0
```

### **Breakpoints Responsive**
```
Mobile: < 768px (mantener diseño actual)
Tablet: 768px - 1024px (transición)
Desktop: > 1024px (nuevo diseño web)
Wide Desktop: > 1440px (optimizado)
```

### **Tipografía**
```
- Inter o system-ui stack
- Escala: 14px base, 16px body, 20px h3, 24px h2, 32px h1
- Pesos: 400 regular, 500 medium, 600 semibold, 700 bold
- Line height: 1.5 body, 1.3 headings
```

## 🏗️ Layout Master para Web

### **Estructura Principal**
```
┌─────────────────────────────────────────────────────┐
│  HEADER                                             │
│  ┌─────┐  ┌────────────────────────────────────┐   │
│  │ LOGO│  │ Search | Notif | User Menu         │   │
│  └─────┘  └────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  SIDEBAR               CONTENT AREA                 │
│  ┌────────────┐      ┌──────────────────────────┐  │
│  │ ● Dashboard│      │                          │  │
│  │ ● Movimientos     │    Contenido Principal   │  │
│  │ ● Agregar  │      │                          │  │
│  │ ● Reportes │      │                          │  │
│  │ ● Socios   │      │                          │  │
│  │ ● Locales  │      │                          │  │
│  │ ● Config   │      │                          │  │
│  │ ● Usuarios*│      └──────────────────────────┘  │
│  └────────────┘                                    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### **Header (Desktop)**
```typescript
interface HeaderProps {
  // Logo a la izquierda
  // Barra de búsqueda global (opcional)
  // Notificaciones (badge con count)
  // Menú usuario: avatar + dropdown (perfil, logout)
  // Selector de tema (auto/light/dark)
  // Responsive: en mobile se convierte en hamburger menu
}
```

### **Sidebar Navigation (Desktop)**
```typescript
interface SidebarItem {
  icon: string; // Ionicons name
  label: string;
  route: string;
  badge?: number; // para notificaciones
  children?: SidebarItem[]; // submenús (acordeón)
  permission?: string; // control por rol
}

// Items principales (basado en tabs actuales + nuevos)
const sidebarItems = [
  { icon: 'stats-chart', label: 'Dashboard', route: '/dashboard' },
  { icon: 'list', label: 'Movimientos', route: '/movements' },
  { icon: 'add-circle', label: 'Agregar Movimiento', route: '/add' },
  { icon: 'document-text', label: 'Reportes', route: '/reports' },
  { icon: 'people', label: 'Socios', route: '/partners' },
  { icon: 'business', label: 'Locales', route: '/business-units' },
  { icon: 'settings-outline', label: 'Configuración', route: '/settings' },
  // Nuevos para gestión de usuarios (con autenticación)
  { icon: 'person-add', label: 'Usuarios', route: '/users', permission: 'manage_users' },
  { icon: 'shield-checkmark', label: 'Permisos', route: '/permissions', permission: 'manage_users' },
];
```

### **Content Area**
- Padding: 24px (desktop), 16px (tablet)
- Max-width: 1400px (centrado en wide screens)
- Scroll vertical independiente
- Breadcrumbs opcional para navegación profunda

## 📱 Adaptación por Pantalla

### **1. DashboardScreen.tsx (Web Optimizado)**
```
┌─────────────────────────────────────────────────────────┐
│  PERIODO: [7 días ▽]     FILTROS: [Todos Locales ▽]    │
├─────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Ventas   │ │ Tickets  │ │ Avg.Ticket│ │ Locales  │  │
│  │ $268,001 │ │   90     │ │  $2,978  │ │    4     │  │
│  │ +12%     │ │ +8%      │ │ +4%      │ │ Activos  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │                  GRÁFICO LÍNEAS                  │  │
│  │  (2 columnas en desktop, full width en mobile)  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────┐ ┌──────────────┐                    │
│  │ TOP LOCALES  │ │ ÚLTIMOS MOVS │                    │
│  │ • Local 1    │ │ • Mov $1000  │                    │
│  │ • Local 2    │ │ • Mov $800   │                    │
│  │ • Local 3    │ │ • Mov $600   │                    │
│  └──────────────┘ └──────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

**Mejoras Web:**
- Grid de 2-4 columnas para KPIs
- Gráfico más ancho con tooltips on hover
- Tabla de últimos movimientos con sorting
- Filtros avanzados en toolbar
- Exportar datos (CSV, PDF)

### **2. MovementsListScreen.tsx (Web Optimizado)**
```
┌─────────────────────────────────────────────────────────┐
│  MOVIMIENTOS DE CAJA                                    │
│  ┌─────────────────┐ ┌─────────────────┐               │
│  │ LOCAL: [Todos ▽]│ │ FECHA: [7d ▽]   │ [🔍 Buscar]   │
│  └─────────────────┘ └─────────────────┘               │
├─────────────────────────────────────────────────────────┤
│  RESUMEN: Ingresos: $X | Egresos: $Y | Saldo: $Z       │
├─────────────────────────────────────────────────────────┤
│  ┌───┬─────┬─────────┬───────┬─────────┬───────┬─────┐ │
│  │ # │Fecha│ Local   │ Tipo  │ Monto   │ Desc  │ Acc │ │
│  ├───┼─────┼─────────┼───────┼─────────┼───────┼─────┤ │
│  │ 1 │18/02│ MDCDIII │ CR    │ $1,000  │ Ventas│ ✏️ 🗑│ │
│  │ 2 │18/02│ FugaZ   │ CR    │ $800    │ Ventas│ ✏️ 🗑│ │
│  │ 3 │17/02│ Diburger│ DB    │ $200    │ Gastos│ ✏️ 🗑│ │
│  └───┴─────┴─────────┴───────┴─────────┴───────┴─────┘ │
│                                                         │
│  PAGINACIÓN: [1] 2 3 4 5 ... [Siguiente]               │
│  MOSTRAR: [50] por página | Total: 90 movimientos      │
└─────────────────────────────────────────────────────────┘
```

**Mejoras Web:**
- Tabla con sorting por columnas (click en header)
- Filtros avanzados (tipo, categoría, rango de montos)
- Búsqueda en tiempo real
- Paginación cliente/servidor
- Acciones batch (seleccionar múltiples)
- Exportar selección/filtro actual
- Vista de calendario/semana (alternativa)

### **3. AddMovementScreen.tsx (Web Optimizado)**
```
┌─────────────────────────────────────────────────────────┐
│  NUEVO MOVIMIENTO                                       │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐                     │
│  │ Tipo: [CR ▽] │ │ Local: [▽]   │                     │
│  └──────────────┘ └──────────────┘                     │
│  ┌──────────────┐ ┌──────────────┐                     │
│  │ Categoría[▽] │ │ Monto: [____]│                     │
│  └──────────────┘ └──────────────┘                     │
│                                                         │
│  Descripción: [______________________________________]  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Fecha: [18/02/2026] Hora: [14:30]               │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ SOCIO ASOCIADO: [Socio Operativo (p2)]           │  │
│  │ (solo para distribuciones/retiros)               │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  [Cancelar]                    [Guardar Movimiento]    │
└─────────────────────────────────────────────────────────┘
```

**Mejoras Web:**
- Formulario en 2 columnas (mejor uso de espacio)
- Validación en tiempo real
- Historial rápido de últimos movimientos (sidebar)
- Plantillas de movimientos frecuentes
- Atajos de teclado (Ctrl+S para guardar)
- Calculadora integrada para montos

### **4. PartnersScreen.tsx (Web Optimizado)**
```
┌─────────────────────────────────────────────────────────┐
│  GESTIÓN DE SOCIOS                                      │
│  [➕ Nuevo Socio] [📊 Reporte] [📥 Exportar]           │
├─────────────────────────────────────────────────────────┤
│  ┌───┬─────┬─────────┬──────┬──────┬───────┬─────┐     │
│  │ # │ ID  │ Nombre  │ Rol  │ Part.%│ Estado│ Acc │    │
│  ├───┼─────┼─────────┼──────┼──────┼───────┼─────┤    │
│  │ 1 │ p1  │ Admin   │ Gerente│ 50% │ Activo│ ✏️ 🗑│    │
│  │ 2 │ p2  │ Socio 2 │ Socio │ 50% │ Activo│ ✏️ 🗑│    │
│  └───┴─────┴─────────┴──────┴──────┴───────┴─────┘    │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │                  CUENTAS CORRIENTES              │  │
│  │  Socio          │ Balance     │ Última Transac.  │  │
│  │  Administrador  │ $0.00       │ --               │  │
│  │  Socio Operativo│ $0.00       │ --               │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Mejoras Web:**
- Vista split: lista socios + detalles/edit en mismo view
- Gráfico de distribución de porcentajes
- Historial de transacciones por socio
- Filtros por rol, estado, porcentaje
- Validación en tiempo real de sumatoria 100%

### **5. BusinessUnitsScreen.tsx (Web Optimizado)**
```
┌─────────────────────────────────────────────────────────┐
│  UNIDADES DE NEGOCIO                                    │
│  [➕ Nuevo Local] [🎨 Colores] [↕️ Ordenar]           │
├─────────────────────────────────────────────────────────┤
│  ┌───┬─────┬─────────┬─────────┬──────┬───────┬─────┐  │
│  │ # │Color│ Nombre  │Ubicación│Orden │ Estado│ Acc │  │
│  ├───┼─────┼─────────┼─────────┼──────┼───────┼─────┤  │
│  │ 1 │🟢   │ MDCDIII │ Centro  │ 1    │ Activo│✏️ 🗑│  │
│  │ 2 │🟡   │ FugaZ   │ Norte   │ 2    │ Activo│✏️ 🗑│  │
│  │ 3 │🔵   │ Diburger│ Sur     │ 3    │ Activo│✏️ 🗑│  │
│  └───┴─────┴─────────┴─────────┴──────┴───────┴─────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │               VISTA PREVIA DASHBOARD             │  │
│  │  (Muestra cómo se ven los colores en gráficos)   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Mejoras Web:**
- Drag & drop para reordenar locales
- Preview en tiempo real de colores
- Estadísticas por local (ventas, movimientos)
- Bulk edit de múltiples locales

### **6. ReportsScreen.tsx (Web Optimizado)**
```
┌─────────────────────────────────────────────────────────┐
│  REPORTES Y ANÁLISIS                                    │
│  ┌─────────────────┐ ┌─────────────────┐               │
│  │ PERIODO: [▽]    │ │ FORMATO: [▽]    │ [Generar]     │
│  └─────────────────┘ └─────────────────┘               │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │ 📊 Ventas    │ │ 👥 Socios    │ │ 🏪 Locales    │   │
│  │ Diario/Semanal│ │ Distribución │ │ Performance   │   │
│  │ por local     │ │ utilidades   │ │ comparativa  │   │
│  └──────────────┘ └──────────────┘ └──────────────┘   │
│                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │ 💰 Flujo     │ │ 📈 Tendencias│ │ 🎯 KPI        │   │
│  │ de Caja      │ │ históricas   │ │ Dashboard    │   │
│  │              │ │              │ │ ejecutivo    │   │
│  └──────────────┘ └──────────────┘ └──────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │                  REPORTE GENERADO                │  │
│  │  (Vista previa o área de visualización)         │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Mejoras Web:**
- Grid de reportes tipo "cards"
- Previsualización en tiempo real
- Parámetros avanzados de reporte
- Exportar múltiples formatos (PDF, Excel, CSV)
- Programar reportes recurrentes
- Biblioteca de plantillas

### **7. SettingsScreen.tsx (Web Optimizado)**
```
┌─────────────────────────────────────────────────────────┐
│  CONFIGURACIÓN DEL SISTEMA                              │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────┐                                    │
│  │ NAVEGACIÓN      │  ┌──────────────────────────────┐ │
│  │ • General       │  │  APARIENCIA                  │ │
│  │ • Datos         │  │  Tema: [● Auto ○ Light ○ Dark]│ │
│  │ • Seguridad     │  │  Lupa gráficos: [✓]         │ │
│  │ • Avanzado      │  │                              │ │
│  └─────────────────┘  └──────────────────────────────┘ │
│                                                         │
│                    ┌──────────────────────────────┐    │
│                    │  DATOS DE PRUEBA             │    │
│                    │  [Generar Simulacro]         │    │
│                    │  [Borrar Movimientos]        │    │
│                    │  [Reinicio Total]            │    │
│                    └──────────────────────────────┘    │
│                                                         │
│                    ┌──────────────────────────────┐    │
│                    │  SOCIO GERENTE               │    │
│                    │  Actual: Admin (p1)          │    │
│                    │  [Cambiar Socio Gerente]     │    │
│                    └──────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

**Mejoras Web:**
- Layout tipo "panel de control"
- Navegación lateral por categorías
- Configuraciones avanzadas (API keys, webhooks)
- Backup/restore de datos
- Logs del sistema
- Monitor de rendimiento

## 🧩 Componentes Web Específicos

### **DataTable Component**
```typescript
interface DataTableProps {
  columns: ColumnDef[];
  data: any[];
  pagination?: boolean;
  sorting?: boolean;
  filtering?: boolean;
  selection?: boolean;
  actions?: TableAction[];
  onRowClick?: (row: any) => void;
}

// Features:
// - Sorting por columnas (click header)
// - Filtros por columna
// - Selección múltiple (checkboxes)
// - Acciones batch
// - Paginación cliente/servidor
// - Export selección
// - Responsive (stack en mobile)
```

### **Advanced Filters Panel**
```typescript
interface FilterPanelProps {
  filters: FilterConfig[];
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onApply: () => void;
  onReset: () => void;
}

// Tipos de filtros:
// - Range (fechas, montos)
// - Multi-select (categorías, locales)
// - Search (texto)
// - Boolean (sí/no)
// - Custom (componente personalizado)
```

### **Sidebar Navigation (Acordeón)**
```typescript
interface SidebarProps {
  items: SidebarItem[];
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  activeRoute?: string;
}

// Comportamiento:
// - Expandir/colapsar (toggle)
// - Submenús acordeón
// - Badges para notificaciones
// - Highlight ruta activa
// - Responsive: hamburger en mobile
```

### **Dashboard Widget System**
```typescript
interface WidgetProps {
  id: string;
  title: string;
  type: 'kpi' | 'chart' | 'table' | 'custom';
  data: any;
  size: 'small' | 'medium' | 'large' | 'full';
  config?: WidgetConfig;
}

// Features:
// - Drag & drop para reordenar
// - Resize widgets
// - Configurar por widget
// - Guardar layouts personalizados
// - Compartir layouts entre usuarios
```

## 🎮 Estados Interactivos (Web)

### **Hover States**
```
Buttons:
- Normal: bg-primary, text-white
- Hover: bg-primary-dark (10% más oscuro)
- Active: bg-primary-darker (20% más oscuro)
- Disabled: opacity-50, cursor-not-allowed

Cards:
- Normal: bg-surface, border-border
- Hover: border-primary, shadow-md
- Selected: border-primary-2, bg-surface-light

Table Rows:
- Normal: transparent
- Hover: bg-surface-light
- Selected: bg-primary/10
```

### **Focus States (Accesibilidad)**
```
- Outline: 2px solid primary, offset 2px
- Keyboard navigation support
- Skip to content link
- ARIA labels para componentes complejos
```

### **Loading States**
```
- Skeleton screens para contenido pesado
- Progress indicators para operaciones largas
- Optimistic updates donde sea posible
- Error states con opciones de retry
```

## 📐 Responsive Behavior

### **Mobile (< 768px)**
- Mantener diseño actual (bottom tabs)
- Hamburger menu para navegación
- Stack vertical para todos los componentes
- Touch-friendly targets (min 44px)
- Gestures para navegación

### **Tablet (768px - 1024px)**
- Sidebar colapsable (iconos + tooltips)
- Grid de 2 columnas donde aplicable
- Mix de touch y mouse interactions
- Adaptar tablas para scroll horizontal

### **Desktop (> 1024px)**
- Sidebar expandida completa
- Grids de 2-4 columnas
- Hover states activos
- Keyboard shortcuts
- Multi-column layouts

### **Wide Desktop (> 1440px)**
- Max-width centrado (1400px)
- Más whitespace
- Sidebars adicionales (stats, chat, etc.)
- Vista split para edición/lista

## 🚀 Implementación Strategy

### **Fase 1: Layout Base (1-2 días)**
1. Header responsive con logo y user menu
2. Sidebar navigation colapsable
3. Content area con padding adecuado
4. Sistema de breakpoints

### **Fase 2: Componentes Web (2-3 días)**
1. DataTable con sorting/filtering
2. AdvancedFilters panel
3. Dashboard widget system
4. Formularios mejorados (2 columnas)

### **Fase 3: Adaptación Pantallas (3-4 días)**
1. Dashboard con grid layout
2. MovementsList con tabla avanzada
3. Partners con vista split
4. Reports con card grid

### **Fase 4: Polish y Optimización (1-2 días)**
1. Hover/focus states
2. Keyboard navigation
3. Performance optimizations
4. Testing cross-browser

## 🔧 Consideraciones Técnicas

### **Compatibilidad con Mobile**
- Mantener funcionalidad existente
- Feature detection para web-only features
- Shared components con Platform.select
- Progressive enhancement

### **Performance Web**
- Virtual scrolling para listas largas
- Lazy loading de componentes pesados
- Optimistic updates
- Cache estratégico

### **Accesibilidad**
- Keyboard navigation completa
- Screen reader support
- Color contrast verificados
- ARIA labels para componentes complejos

### **Mantenibilidad**
- Componentes reutilizables
- Custom hooks para lógica web
- Theme variables para web-specific styles
- Documentation de componentes web

## 🎨 Design Tokens (Web Extensions)

```css
/* Añadir al sistema de diseño existente */
:root {
  /* Espaciado web */
  --spacing-web-xs: 4px;
  --spacing-web-sm: 8px;
  --spacing-web-md: 16px;
  --spacing-web-lg: 24px;
  --spacing-web-xl: 32px;
  --spacing-web-2xl: 48px;
  
  /* Sombras web */
  --shadow-web-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-web-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-web-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  
  /* Border radius web */
  --radius-web-sm: 6px;
  --radius-web-md: 8px;
  --radius-web-lg: 12px;
  --radius-web-xl: 16px;
  
  /* Transiciones web */
  --transition-web-fast: 150ms ease;
  --transition-web-normal: 250ms ease;
  --transition-web-slow: 350ms ease;
}
```

## 📋 Checklist de Implementación

### **Prioridad Alta (Core Experience)**
- [ ] Header responsive con user menu
- [ ] Sidebar navigation colapsable
- [ ] Content area layout básico
- [ ] DataTable component con sorting
- [ ] Dashboard grid layout
- [ ] Movements table avanzada

### **Prioridad Media (Enhanced UX)**
- [ ] Advanced filters panel
- [ ] Formularios 2-columnas
- [ ] Hover/focus states
- [ ] Keyboard navigation
- [ ] Export functionality
- [ ] Bulk actions

### **Prioridad Baja (Nice to Have)**
- [ ] Dashboard widget drag & drop
- [ ] Report templates gallery
- [ ] Custom theme editor
- [ ] Keyboard shortcuts
- [ ] Offline mode web
- [ ] Real-time updates (websockets)

---

**Este diseño proporciona una base sólida para una experiencia web profesional y productiva, manteniendo coherencia visual con la app móvil existente y preparando el terreno para futuras funcionalidades como el sistema de autenticación.**