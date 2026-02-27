# Gestión de Capital de Socios

## Estado: EN REVISIÓN (pendiente de definición)

## Propósito
Permitir a los socios realizar operaciones en sus cuentas:
- **Aportes de Capital**: Depósitos sin límite
- **Retiros de Dinero**: Con validación de límite

## Reglas de Negocio

### Aportes
- Sin límite de monto
- Requiere aprobación del Socio Gerente
- Tipo: CR (crédito)
- Origin: CAPITAL_CONTRIBUTION

### Retiros
- Límite: Balance Caja × % Participación
- Requiere aprobación del Socio Gerente
- Tipo: DB (débito)
- Origin: WITHDRAWAL

## Pendiente de Definir

### 1. Cálculo de límite considerando retiros colectivos
- ¿Cómo calcular cuando todos los socios pueden retirar?
- ¿Reserva para giro del negocio?
- ¿Monto mínimo en caja?

### 2. Reserva para operaciones
- Porcentaje fijo del balance
- Monto configurable por Socio Gerente
- Según históricos del negocio

## Estructura de Datos Existente

### Tablas
- `partner_accounts` - Cuentas de socios
- `partner_account_transactions` - Transacciones

### Campos de partner_account_transactions
- type: DB | CR
- origin: WITHDRAWAL | DISTRIBUTION | SETTLEMENT_PAYMENT | EXPENSE_REIMBURSEMENT | ADJUSTMENT | CAPITAL_CONTRIBUTION

## Funcionalidad Propuesta

### Pantalla: PartnerCapitalScreen
- Lista de socios con saldo y % participación
- Columna "Límite de retiro" calculado
- Solicitar aporte/retiro
- Pendientes de aprobación (Socio Gerente)
- Historial de transacciones

### Flujo
1. Socio solicita retiro
   - Valida: Monto ≤ (Balance Caja × % Participación)
2. Queda PENDIENTE
3. Socio Gerente revisa
   - Aprueba → Actualiza saldo
   - Rechaza → Notifica
