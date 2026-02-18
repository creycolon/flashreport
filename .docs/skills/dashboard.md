# Dashboard Ejecutivo (Flash Report)

## Purpose
Centralized executive dashboard for Business Unit, Unidades de Negocio, service station chain, hamburger chain, fast food chain, management providing real-time insights into:
- Sales performance across multiple locations
- Partner account balances and alerts
- Cash flow monitoring
- Key performance indicators (KPIs)
- Responsive visualization for mobile and tablet use

## Architecture Overview
The dashboard follows a modular React Native architecture with clean separation:

```
DashboardScreen (src/presentation/screens/DashboardScreen.js)
├── Header: Partner info & alerts
├── KPICard[]: Performance indicators with responsive sizing
├── LineChart: Multi-series UnidadNegocio sales visualization
├── UnidadNegocioAlertsLine: Location-specific alerts
├── AlertCard[]: System notifications
└── Refresh control & interval selector
```

**Data Flow:**
1. DashboardScreen initializes with `useAuth()` and `useWindowDimensions()`
2. Fetches data from domain services (`cashAccountService`, `UnidadNegocioService, carService,fastfootchain`)
3. Transforms data for visualization components
4. Components render with responsive styles based on screen size
5. User interactions trigger data refreshes or interval changes

## Core Components

### DashboardScreen (Main Container)
**File:** `src/presentation/screens/DashboardScreen.js`

**Key Responsibilities:**
- Screen-level state management (loading, refreshing, data)
- Responsive layout calculations using `useWindowDimensions()`
- Data fetching and transformation for child components
- Interval selection (weekly/biweekly/monthly) for chart data

**Critical Code Patterns:**
```javascript
// Responsive screen detection with undefined fallback
const { width: windowWidth } = useWindowDimensions();
const isSmallScreen = windowWidth !== undefined ? windowWidth < 400 : false;

// Responsive styles with useMemo dependency
const styles = useMemo(() => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: isSmallScreen ? spacing.space.md : spacing.space.lg,
    paddingTop: spacing.space.lg,
  },
  // ... other styles
}), [isSmallScreen]);
```

### LineChart (Multi-Series Visualization)
**File:** `src/presentation/components/LineChart.js`

**Key Features:**
- Multi-series line chart supporting unlimited Business units
- Responsive SVG rendering with mobile optimizations
- Hierarchical width calculation (prop > container > window)
- Gradient backgrounds and interactive points

**Critical Code Patterns:**
```javascript
// Hierarchical width system for SVG
const windowWidthMinusPadding = windowWidth !== undefined ? 
  windowWidth - responsivePaddingLeft - responsivePaddingRight : 0;
const finalWidth = width || containerWidth || windowWidthMinusPadding || 300;

// Responsive scaling functions
const xScale = (index) => {
  return (index / (labels.length - 1 || 1)) * chartWidth + responsivePaddingLeft;
};

const yScale = (value) => {
  const scaled = ((value - minValue) / (maxValue - minValue || 1)) * chartHeight;
  return chartHeight - scaled + responsivePaddingTop;
};
```

### KPICard (Performance Indicators)
**File:** `src/presentation/components/KPICard.js`

**Key Features:**
- Dynamic styling based on screen size (420px, 500px breakpoints)
- Status color logic based on variation percentages
- Icon selection (ArrowUp, ArrowDown, Minus) with color coding
- Shadow and border consistency with design system

**Critical Code Patterns:**
```javascript
// Responsive breakpoints for KPICard
const { width } = useWindowDimensions();
const isSmallScreen = width < 420;
const isMediumScreen = width >= 420 && width < 500;

// Dynamic status color logic
const getStatusColors = () => {
  if (variation > 0) {
    return { text: colors.success, bg: colors.successLight, icon: ArrowUp };
  }
  if (variation >= -2) {
    return { text: colors.neutral, bg: colors.neutralLight, icon: Minus };
  }
  if (variation >= -3) {
    return { text: colors.warning, bg: colors.warningLight, icon: ArrowDown };
  }
  return { text: colors.danger, bg: colors.dangerLight, icon: ArrowDown };
};
```

## Responsive Design Implementation

### Breakpoint System
The dashboard uses three primary breakpoints:

| Breakpoint | Value | Component | Purpose |
|------------|-------|-----------|---------|
| Dashboard | 400px | DashboardScreen | Overall layout padding and spacing |
| KPICard Small | 420px | KPICard | Card sizing and typography |
| KPICard Medium | 500px | KPICard | Enhanced card dimensions |

### Responsive Patterns

**1. Safe Window Dimension Handling:**
```javascript
// Always check for undefined in web/mock environments
const { width: windowWidth } = useWindowDimensions();
const isSmallScreen = windowWidth !== undefined ? windowWidth < 400 : false;
```

**2. useMemo for Style Optimization:**
```javascript
const styles = useMemo(() => StyleSheet.create({
  // Styles that depend on screen size
}), [isSmallScreen]); // Recalculates only when isSmallScreen changes
```

**3. Responsive Padding Scaling:**
```javascript
// LineChart.js: Responsive padding adjustments
const responsivePaddingLeft = isSmallScreen ? 
  Math.max(paddingLeft * 0.7, 20) : paddingLeft;
```

**4. Font Size Adaptation:**
```javascript
// LineChart.js: Mobile text sizing
const labelFontSize = isSmallScreen ? 8 : 10;
const axisLabelFontSize = isSmallScreen ? 9 : 10;
```

### Design System Integration
The dashboard leverages the centralized design system:

- **Colors:** `src/design-system/colors.js` - Consistent color tokens
- **Spacing:** `src/design-system/spacing.js` - Proportional spacing scale
- **Typography:** `src/design-system/typography.js` - Font scales and weights

## Key Technical Patterns

### 1. Undefined Window Dimension Handling
**Problem:** `useWindowDimensions()` returns `undefined` in certain environments (web mock, tests).
**Solution:** Always include undefined checks with fallback values.

```javascript
// DashboardScreen.js:22
const isSmallScreen = windowWidth !== undefined ? windowWidth < 400 : false;

// LineChart.js:33
const isSmallScreen = windowWidth !== undefined ? windowWidth < 400 : false;
```

### 2. Hierarchical Width Calculation for SVG
**Problem:** SVG charts need explicit width, but should adapt to container and screen.
**Solution:** Three-level width hierarchy with fallbacks.

```javascript
// LineChart.js:49-51
const windowWidthMinusPadding = windowWidth !== undefined ? 
  windowWidth - responsivePaddingLeft - responsivePaddingRight : 0;
const finalWidth = width || containerWidth || windowWidthMinusPadding || 300;
```

### 3. Responsive Style Caching with useMemo
**Problem:** Style recalculation on every render impacts performance.
**Solution:** Memoize styles based on screen size dependency.

```javascript
// DashboardScreen.js: (pattern example)
const styles = useMemo(() => StyleSheet.create({...}), [isSmallScreen]);
```

### 4. Dynamic Status Color Logic
**Problem:** KPICard colors/icons should change based on business rules.
**Solution:** Centralized function with clear thresholds.

```javascript
// KPICard.js:16-43
const getStatusColors = () => {
  if (variation > 0) return successColors;
  if (variation >= -2) return neutralColors;
  if (variation >= -3) return warningColors;
  return dangerColors;
};
```

## Common Issues & Solutions

### Issue 1: `isSmallScreen` is undefined
**Symptom:** Styles don't adapt correctly in web preview or tests.
**Root Cause:** `useWindowDimensions()` returns `undefined` in mock environments.
**Solution:** Always add undefined check with fallback.
```javascript
// ❌ Incorrect
const isSmallScreen = windowWidth < 400;

// ✅ Correct (DashboardScreen.js:22)
const isSmallScreen = windowWidth !== undefined ? windowWidth < 400 : false;
```

### Issue 2: Shadow props deprecated in React Native
**Symptom:** Shadow properties don't work or show warnings.
**Root Cause:** React Native deprecated `shadowColor`, `shadowOffset`, etc.
**Solution:** Use design system shadow utilities.
```javascript
// ✅ Use spacing.shadows from design system
...spacing.shadows.md  // Contains platform-appropriate shadow styles
```

### Issue 3: SVG charts overflow container
**Symptom:** LineChart extends beyond screen bounds on small devices.
**Root Cause:** Fixed width calculations without container measurement.
**Solution:** Implement hierarchical width with container layout measurement.
```javascript
// LineChart.js:27-30
const handleLayout = useCallback((event) => {
  const { width } = event.nativeEvent.layout;
  setContainerWidth(width);
}, []);
```

### Issue 4: Performance degradation with many KPICards
**Symptom:** Dashboard becomes slow with multiple KPICard instances.
**Root Cause:** Each KPICard recalculates styles on every render.
**Solution:** Implement proper memoization and consider FlatList for many cards.
```javascript
// Consider for future optimization
const MemoizedKPICard = React.memo(KPICard);
```

## Integration Points

### Authentication Context
**File:** `src/contexts/AuthContext.js`
**Usage:** `const { currentPartner, isManagingPartner } = useAuth();`
**Purpose:** Personalize dashboard content based on partner role and permissions.

### Domain Services
**Cash Account Service:** `src/domain/services/cashAccountService.js`
- `getCashBalance()`: Total cash in system
- `getPartnerBalance(partnerId)`: Individual partner balance
- `getAlerts()`: Financial alerts and notifications

**Business_Unit Service:** `src/domain/services/UnidadNegocioService.js`
- `getUnidadNegocioSalesData(interval)`: Sales data for chart visualization
- `getAllUnidadNegocios()`: UnidadNegocio list with colors and metadata
- `getUnidadNegocioAlerts()`: Location-specific operational alerts

### Design System Tokens
**Consistent Usage:**
```javascript
import { colors } from '../../design-system/colors';
import { spacing } from '../../design-system/spacing';
import { typography } from '../../design-system/typography';

// All styles reference tokens, not hardcoded values
backgroundColor: colors.background,
padding: spacing.space.lg,
fontSize: typography.fontSizes.lg,
```

### Component Library
**Location:** `src/presentation/components/index.js`
**Available Components:** `KPICard`, `AlertCard`, `UnidadNegocioAlertsLine`, `Card`, `Typography`, `LineChart`
**Usage:** Import from centralized component library for consistency.

## Testing Considerations

### Responsive Testing
- Test at breakpoints: 399px, 400px, 419px, 420px, 499px, 500px
- Verify style changes at each breakpoint
- Test undefined windowWidth scenario (mock environments)

### Performance Testing
- Monitor render times with 5+ KPICards
- Test chart performance with 3+ UnidadNegocio series
- Verify memory usage during data refreshes

### Data Integration Testing
- Test empty state (no data)
- Test error states (service failures)
- Test refresh functionality
- Test interval switching (weekly/biweekly/monthly)

## Maintenance Guidelines

### Adding New Dashboard Components
1. Follow responsive patterns (check `isSmallScreen`)
2. Use design system tokens (colors, spacing, typography)
3. Implement proper memoization for performance
4. Include undefined checks for window dimensions
5. Test across all breakpoints

### Modifying Breakpoints
1. Update both DashboardScreen and LineChart if changing 400px breakpoint
2. Update KPICard for 420px/500px changes
3. Test edge cases (399px, 400px, 419px, 420px, etc.)
4. Update documentation (this skill)

### Extending Chart Functionality
1. Maintain hierarchical width calculation
2. Keep responsive padding and text sizing
3. Add new props with sensible defaults
4. Test on small screen devices

---

*Última actualización: Febrero 2026*  
*Responsable: Equipo de Desarrollo Flash Report*
