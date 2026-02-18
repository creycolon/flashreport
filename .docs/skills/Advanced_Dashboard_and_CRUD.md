# Advanced Dashboard & Unified CRUD with Soft-Delete

Este skill documenta la implementación de un Dashboard analítico avanzado con filtros temporales y un sistema CRUD unificado con lógica de Alta/Baja (Soft Delete) para gestión de entidades.

## 1. Patrón de CRUD Unificado con Soft-Delete

En lugar de eliminar físicamente los registros, utilizamos un sistema de "Estado Activo" para mantener la integridad referencial histórica.

### Repositorio (Backend Logic)
El método `getAll` debe aceptar un parámetro opcional para incluir o excluir inactivos según el contexto (Gestión vs Operación).

```javascript
// repository.js
export const entityRepository = {
    // Por defecto solo activos (para selects operativos)
    // Con includeInactive = true (para pantallas de gestión)
    getAll: async (includeInactive = false) => {
        const db = await getDatabase();
        const sql = includeInactive 
            ? 'SELECT * FROM entities ORDER BY name' 
            : 'SELECT * FROM entities WHERE is_active = 1 ORDER BY name';
        return await db.getAllAsync(sql);
    },

    // Soft Delete: Marca como inactivo
    softDelete: async (id) => {
        const db = await getDatabase();
        await db.runAsync('UPDATE entities SET is_active = 0 WHERE id = ?', [id]);
    },

    // Reactivación
    reactivate: async (id) => {
        const db = await getDatabase();
        await db.runAsync('UPDATE entities SET is_active = 1 WHERE id = ?', [id]);
    }
};
```

### UI de Gestión (Screen Pattern)
La pantalla de gestión debe mostrar todos los registros, diferenciando visualmente los inactivos.

*   **Lista**: Renderizar elementos con opacidad reducida si `!is_active`.
*   **Acciones**: Botón dinámico "DAR DE BAJA" (si activo) o "DAR DE ALTA" (si inactivo).
*   **Creación/Edición**: Usar un Modal único para ambas acciones.
*   **Navegación**: Incluir siempre un botón "Volver" (`router.back()`) si es una pantalla secundaria.

## 2. Dashboard Analítico con Filtros Temporales

Implementación de un dashboard que recalcula KPIs y gráficos según el rango seleccionado (Semana, Mes, Año).

### Service Layer (Lógica de Datos)
El servicio debe aceptar un parámetro `days` para filtrar las consultas.

```javascript
// financialService.js
getGlobalMetrics: async (days = 7) => {
    // Calcular fecha de inicio
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];
    
    // Consultar repositorio con filtro de fecha
    return await repository.getMetrics(startDateStr);
},
```

### Generación de Etiquetas para Gráficos
Para que el eje X sea legible en cualquier rango, usamos una generación de etiquetas contextual:

```javascript
// financialService.js -> getChartData(days)
const labels = dateLabels.map((dateStr, idx) => {
    const [y, m, d] = dateStr.split('-');
    const dateObj = new Date(y, m - 1, d);
    
    if (days <= 7) {
        // Semana: Lu, Ma, Mi
        return daysOfWeek[dateObj.getDay()];
    } else if (days <= 31) {
        // Mes: Numero de día. 
        // Mostrar Mes si es el 1ro, el primer dato o el último (Contexto)
        if (idx === 0 || d === '01' || idx === dateLabels.length - 1) {
            return `${parseInt(d)} ${months[dateObj.getMonth()]}`;
        }
        return parseInt(d).toString();
    } else {
        // Año: Solo mostrar etiqueta si coincide con el día de HOY (Anclaje)
        const todayDay = new Date().getDate();
        if (parseInt(d) === todayDay) {
             return `${parseInt(d)}/${months[dateObj.getMonth()]}`;
        }
        return '';
    }
});
```

### Componente de Gráfico Inteligente (LineChart)
El gráfico debe manejar la densidad de etiquetas para evitar superposiciones, priorizando siempre la etiqueta más reciente (Hoy).

```typescript
// LineChart.tsx
// Dentro del .map de etiquetas del eje X:

if (!label) return null; // Saltar etiquetas vacías (Annual view)

// Lógica de "Stepping" para vistas densas (Monthly view)
const totalLabels = labels.length;
const visibleLabelsCount = labels.filter(l => l).length;

if (visibleLabelsCount > 10) {
     // Calcular ancho dinámico según longitud del texto
     const avgLabelLength = labels.reduce((acc, l) => acc + (l ? l.length : 0), 0) / visibleLabelsCount;
     const labelWidth = avgLabelLength <= 2 ? 18 : 45; 
     
     const maxLabels = Math.floor(chartWidth / labelWidth);
     const step = Math.ceil(totalLabels / maxLabels);
     
     // ANCLAJE: Siempre mostrar el último (Hoy) y calcular pasos hacia atrás
     const lastIdx = totalLabels - 1;
     const show = (idx === lastIdx) || ((lastIdx - idx) % step === 0);
     
     if (!show) return null;
}
return <SvgText>{label}</SvgText>;
```

## 3. Resumen de Componentes Clave

*   **`BusinessUnitsScreen.tsx` / `PartnersScreen.tsx`**: Implementación de referencia del CRUD Unificado.
*   **`DashboardScreen.tsx`**: Implementación de filtros y estado del dashboard.
*   **`financialService.js`**: Lógica de agregación y generación de fechas.
*   **`LineChart.tsx`**: Lógica de renderizado SVG adaptable.
