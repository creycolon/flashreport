# FlashHub 🚀

**FlashHub** (Flash Report) is an executive dashboard tailored for restaurant chains, designed to provide real-time financial insights and robust governance for partners and management.

> **⚠️ Migration Notice**: This project has been migrated from SQLite to **Supabase PostgreSQL** for enhanced scalability, real-time capabilities, and cloud synchronization.

## 📌 Documentation
Detailed project architecture and business rules can be found in the `.docs/` directory:
- [Master Plan](.docs/blueprints/master-plan.md)
- [Governance & Settlement Skill](.docs/skills/skill.md)
- [Dashboard Design](.docs/skills/dashboard.md)

## ✨ Core Features

### 📊 Dashboard Ejecutivo (Flash Report)
- Real-time sales monitoring across multiple restaurant locations.
- Key Performance Indicators (KPIs) with visual growth/decline indicators.
- Interactive multi-series charts for strategic trend analysis.
- Responsive design optimized for both mobile and tablet devices.

### 💰 Financial Governance & Settlement
- **Partner Balance Management:** Support for negative balances, allowing flexibility in withdrawals.
- **Managing Partner System:** Exclusive administrative role with single-active-partner enforcement.
- **Automatic Compensation:** Future profit distributions automatically offset outstanding debts.
- **Audit & Compliance:** Persistent alerting for unsettled balances and full auditable settlement registration.
- **Expense Conversion:** Ability to convert partner debt into company expenses via invoice reimbursements.

### 🔐 Roles & Security
- **Socio Gerente (Managing Partner):** Full administrative access, balance regularization, and exclusive management privileges.
- **Socio (Partner):** Read-only access to sales, with withdrawal tracking.
- **Role Transition:** Secure transfer of managing partner role with validation and confirmation flows.

### 📱 Modern UI & Cross-Platform
- **Responsive Design:** Optimized for mobile, tablet, and web with platform-specific UI adjustments.
- **Theme System:** Auto/dark/light theme detection with web `matchMedia` support.
- **Dropdown Management:** Platform-aware `zIndex` handling for proper overlay behavior.
- **Clipboard Polyfill:** Robust fallback for clipboard APIs across all platforms.
- **Accessibility:** Semantic components and proper touch targets.

## 🛠 Tech Stack
- **Framework:** React Native with Expo (v54)
- **Navigation:** Expo Router for file-based routing
- **Database:** Supabase PostgreSQL with real-time capabilities
- **Architecture:** Modular Clean Architecture with repository pattern
- **UI Components:** Custom design system with theme context
- **State Management:** React hooks with service layer abstraction
- **DevOps:** EAS (Expo Application Services) for automated builds and deployments

## 🚀 Getting Started

### Prerequisites
- Node.js & npm
- Expo CLI (`npm install -g expo-cli`)
- Supabase account and project

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/creycolon/fast_report.git
   cd flash_report_supabase
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials:
     ```
     EXPO_PUBLIC_SUPABASE_URL=your_project_url
     EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
     ```

4. Start the development server:
   - **Web:** `npm run web`
   - **Mobile:** `npm start` (then press `i` for iOS or `a` for Android)

## 📈 Recent Updates
- **✅ Migration to Supabase PostgreSQL** – Enhanced scalability and real-time capabilities
- **✅ Managing Partner System** – Role-based governance with single-active-partner enforcement
- **✅ Cross-Platform UI Fixes** – Dropdown zIndex handling for web and mobile
- **✅ Theme System** – Auto/dark/light detection with web support
- **✅ Clipboard Polyfill** – Robust fallback for clipboard APIs across platforms
- **✅ Repository Pattern** – Clean architecture abstraction for data access

## 📈 Roadmap
- [x] Navigation architecture setup (Expo Router)
- [x] Database service abstraction layer (Repository pattern)
- [ ] Implementation of the main Dashboard
- [x] Cierre de Caja (Daily closing) module
- [ ] Real-time synchronization across devices
- [ ] Advanced reporting and analytics
- [ ] Multi-language support
- [ ] Offline capability with sync queue

---
*Created by the Flash Report Development Team - 2026*
