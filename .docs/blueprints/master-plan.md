# Flash Report – Master Plan (Supabase Edition)

## Purpose
Executive dashboard for restaurant chains focused on:
- Flash sales reporting across multiple business units
- Partner profit distribution with negative balance support
- Managing Partner system for administrative governance
- Real-time financial insights with cloud synchronization
- Cross-platform accessibility (mobile, tablet, web)

## Core Modules
1. **Dashboard Ejecutivo (Flash Report)** - Real-time sales monitoring and KPIs
2. **Movimientos de Caja** - Cash flow tracking with business unit filtering
3. **Cierre de Caja** - Daily closing operations with validation
4. **Socios y Cuentas Corrientes** - Partner management with managing partner system
5. **Unidades de Negocio** - Business unit configuration and management
6. **Informes y Reportes** - Financial reporting and PDF generation
7. **Configuración General** - Application settings and data management

## Tech Stack
- **Frontend:** React Native with Expo (v54)
- **Navigation:** Expo Router (file-based routing)
- **Database:** Supabase PostgreSQL (cloud, real-time capabilities)
- **Architecture:** Modular Clean Architecture with repository pattern
- **UI/UX:** Custom design system with theme context (auto/dark/light)
- **State Management:** React hooks with service layer abstraction
- **Build/Deploy:** EAS (Expo Application Services)
- **Platforms:** iOS, Android, Web (responsive design)

## Roles & Permissions
- **Socio Gerente (Managing Partner):** Full administrative access, balance regularization, exclusive management privileges, managing partner role assignment
- **Socio (Partner):** Read-only access to sales, withdrawal tracking, limited editing capabilities
- **Role Transition:** Secure transfer of managing partner role with validation and confirmation flows

## Financial Principles
- Negative balance allowed with automatic compensation
- Single managing partner enforcement at all times
- Full auditability with soft-delete pattern
- No hard deletes - maintain historical integrity
- Real-time balance calculations across business units

## Key Architectural Patterns
- **Repository Pattern:** Abstract data access layer (Supabase client)
- **Service Layer:** Business logic encapsulation
- **Theme System:** Platform-aware theme detection (web: matchMedia)
- **Polyfill System:** Robust fallbacks for clipboard and web APIs
- **Responsive UI:** Platform-specific zIndex handling for dropdowns
- **Error Handling:** Graceful degradation with user feedback

## Migration Status
- ✅ **Complete:** Migration from SQLite to Supabase PostgreSQL
- ✅ **Complete:** Managing Partner system implementation
- ✅ **Complete:** Cross-platform UI fixes (dropdowns, themes)
- ✅ **Complete:** Repository pattern abstraction
- 🔄 **In Progress:** Real-time synchronization enhancements
- 📋 **Planned:** Advanced reporting and analytics dashboard

## Implementation Status
- ✅ Navigation architecture (Expo Router)
- ✅ Database service abstraction (Repository pattern)
- ✅ Cash movements with business unit filtering
- ✅ Partner management with managing partner system
- ✅ Business unit CRUD operations
- ✅ Theme system with web support
- ✅ Clipboard polyfill for cross-platform compatibility
- 📋 Dashboard with advanced analytics
- 📋 Profit distribution module
- 📋 Offline capability with sync queue
