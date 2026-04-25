# Template Migration Plan: SecureXAi to RBAC Base Template

## ðŸŽ¯ Goal
Strip down the existing SecureXAi application to its core Employee Management and Onboarding features. Remove all OKR and Performance Management modules to create a clean, RBAC-ready template for a future RAG application.

## ðŸ—‘ï¸ Modules to Remove

### Backend (`Backend/pa-backend`)
- **`src/objective/`**: OKR & Objective tracking endpoints and business logic.
- **`src/feedback/`** & **`src/form-responses/`**: Performance reviews, badges, and 360 feedback.
- **`src/project/`** & **`src/tasks/`**: Assuming these are closely tied to objectives and performance rather than core HR.
- **`src/categories/`**: If strictly tied to OKRs/Feedback.
- **Prisma Schema (`prisma/schema.prisma`)**: Remove tables associated with Objectives, Key Results, Feedback, Reviews, Badges, etc.

### Frontend (`Frontend/pa-frontend`)
- **Public Assets**: `public/okr/`, `public/performance/`, `public/objective/`, `public/badges/`
- **Pages & Components**: 
  - Delete OKR dashboards, Performance review pages, and Objective tracking UI from `src/app/`.
  - Remove related UI components from `src/components/`.
- **State Management & Types**: Remove store slices, hooks, and TypeScript interfaces related to OKRs and Performance.
- **Navigation**: Remove links to OKRs and Performance from the sidebar/navbar constants (e.g., `src/constant.ts`).

## ðŸ›¡ï¸ Modules to Retain & Polish

### Backend (`Backend/pa-backend`)
- **`src/users/`** & **`src/admin/`**: Core user management, employee lifecycle routines, and admin settings.
- **`src/team/`**, **`src/admin/division/`**, **`src/admin/separation/`**: Org chart, departments, and team structural representations.
- **`src/auth/``, `src/oauth/`, & `src/session/`**: Authentication, session management, OTP, and the foundational elements for RBAC.
- **`src/mail/`** & **`src/notification/`**: Essential for onboarding workflows.
- **Prisma Schema**: Keep `User`, `Team`, `Department`, `Division`, `Role`, `Permission` (and related entities).

### Frontend (`Frontend/pa-frontend`)
- **Employee Management**: `public/employee/`, `public/user-profiles/`, org chart components.
- **Onboarding Flows**: Keep the initial signup/setup screens and HR admin views for adding employees.
- **Settings & Auth**: Standard system configurations, RBAC layout (`public/settings/`), and profile settings.

## ðŸ“‹ Execution Steps

### Phase 1: Database Refactoring
1. Review and modify `Backend/pa-backend/prisma/schema.prisma` to drop unneeded models.
2. Ensure referential integrity for remaining models (e.g., User, Team).
3. Generate new Prisma client and prepare to wipe old migrations for a fresh start.

### Phase 2: Backend Cleanup
1. Delete obsolete module directories (`objective`, `feedback`, `form-responses`, etc.).
2. Remove their imports and references from `src/app.module.ts`.
3. Clean up any globally shared services or interceptors interacting with the deleted modules.
4. Run `npm run build` and `npm run test` to catch and resolve broken imports or missing types.

### Phase 3: Frontend Cleanup
1. Delete obsolete `app/` routes (e.g., `/okr`, `/performance`).
2. Delete unused components and associated icons/assets.
3. Update standard layouts and navigation lists in `src/constant.ts` to only show Employee, Team, and Organization.
4. Run standard TypeScript checks (`tsc --noEmit`) and fix front-end type-checking errors.
