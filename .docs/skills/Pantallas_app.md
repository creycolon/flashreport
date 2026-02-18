App Cierre de Cajas 
la aplicación se organiza en una estructura jerárquica de cinco módulos o pantallas principales, diseñadas para cubrir desde la visión estratégica global hasta la carga operativa de datos y la configuración técnica.

A continuación, se detallan los datos y funcionalidades que componen cada pantalla:

### 1. Pantalla de Dashboard (Vista Estratégica)
Es la primera opción del menú y ofrece una visión de "Business Intelligence" sobre el desempeño de las ventas.
*   **Gráfico de Tendencias:** Un histograma o gráfico de líneas que muestra el **Tiempo (Eje X)** versus el **Importe de Ingresos Brutos (Eje Y)**.
*   **Identificación Visual:** Cada empresa cuenta con un **color único** para diferenciar sus líneas o barras en el gráfico.
*   **Filtros de Temporalidad:** Selectores para visualizar datos de forma **semanal, mensual o anual**.
*   **Cuadros de Totales Globales (KPIs):** Al pie del diagrama, se muestran dos cuadros destacados con la **sumatoria total recaudada** y la **cantidad total de tickets** de todas las unidades de negocio combinadas.

### 2. Pantalla de Movimientos (Vista Operativa)
Es la segunda opción del menú y se utiliza para el control diario de los saldos.
*   **Listado Sumarizado:** Muestra como máximo **un registro por día por cada punto de venta**.
*   **Datos por Fila:** Incluye Fecha, Empresa, Unidad de Negocio, Punto de Venta y el **Saldo calculado** (Ingresos - Egresos).
*   **Semáforo de Saldo:** Indicadores visuales en **verde (positivo)** o **rojo (negativo)** según el importe manejado.
*   **Filtros Operativos:** Permite segmentar por empresa, punto de venta específico o una fecha particular.

### 3. Pantalla de Carga y Administración (CRUT)
Esta pantalla es el centro operativo para la entrada de datos y gestión de responsables.
*   **Formulario de Cierre de Caja:**
    *   **Identificación:** Selección mediante combos de Empresa, Unidad de Negocio y Punto de Venta (POS).
    *   **Datos de Cierre:** Fecha (propuesta por el sistema), Hora (automática), Cantidad de Tickets, **Total Ingresos** y **Total Egresos**.
*   **Módulo de Inspección Visual:** Un listado descendente (lo más nuevo arriba) que permite verificar de forma inmediata si faltan días de carga o si hay inconsistencias.
*   **CRUT de Socios:** Sección para dar de alta a los integrantes con su **Nombre/Alias y un Color identificatorio**. Aquí se define quién es el **Socio Administrador/Gerente**.
*   **Regla de Seguridad:** La interfaz solo permite la edición del **último registro cargado**; los anteriores quedan bloqueados para proteger la integridad.

### 4. Pantalla de Informes (PDF)
Módulo dedicado a la exportación de documentos oficiales y auditoría.
*   **Opciones de Filtrado:** Permite generar reportes por empresa, grupo, unidades de negocio, puntos de venta o rangos de fecha.
*   **Salida de Datos:** Generación de **vistas PDF** con totales mensuales o anuales.
*   **Garantía de Integridad:** Los informes consultan exclusivamente **Vistas SQL de registros activos**, omitiendo automáticamente cualquier movimiento que haya sido marcado como inactivo (soft delete) por error.

### 5. Pantalla de Configuración y Parámetros
Sección técnica para personalizar el entorno de trabajo.
*   **Ajustes de Interfaz (UI):** Selector de **Modo Dark/Light** y elección del color primario de la aplicación.
*   **Gestión del Socio Administrador:** Parámetro para definir o cambiar al socio que ejerce la gerencia de los datos.
*   **Herramientas de Simulación (Lote de Prueba):** Botones para **generar un lote de datos ficticios** (desde el mes anterior hasta hoy) para capacitación, y su respectiva función de **borrado automático** de archivos demo.
*   **Reglas de Negocio:** Configuración de días máximos permitidos para carga hacia atrás y obligatoriedad de motivos en correcciones.
