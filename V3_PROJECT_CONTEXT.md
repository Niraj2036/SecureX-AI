# V3 Project Context & Architecture Guide

## Overview
**SecureX AI (V3)** is a modern, full-stack enterprise management application designed to handle Employee Management, Organizational Hierarchy & Charts, Team & Department Structures, Document Access Control, Multi-tenant RBAC, and AI-powered Query Audits (RAG Chat).

This document serves as the authoritative source of truth for future developers and AI coding agents working on this repository.

---

## Technology Stack

### Frontend (`Frontend/pa-frontend`)
- **Framework**: Next.js 14 (App Router) & React 18
- **Language**: TypeScript
- **Styling**: Pure Tailwind CSS & Vanilla CSS (Indigo SaaS palette & HSL variables in `globals.css`)
- **Component Architecture**: Custom, lightweight V3 React + Tailwind Primitives (`src/components/v3/`), Lucide Icons
- **State Management**: Zustand (`sessionStore`, `signupStore`) & React Query (TanStack Query)
- **Authentication**: NextAuth (v5) & Axios HTTP client

### Backend (`Backend/pa-backend`)
- **Framework**: NestJS 10/11 (with SWC compiler)
- **Language**: TypeScript
- **Database & ORM**: PostgreSQL & Prisma ORM (v5)
- **Authentication & Security**: JWT Passport, Google OAuth, Admin Guards, RLS (Row-Level Security) PostgreSQL Middleware
- **Storage & Services**: Cloudinary / DigitalOcean S3 SDK, Nodemailer / SES

---

## Architecture & Directory Structure

```
c:/CAP/
├── Backend/
│   └── pa-backend/
│       ├── prisma/
│       │   └── schema.prisma          # PostgreSQL Prisma Schema & Enums
│       └── src/
│           ├── admin/                 # Admin operations
│           ├── app/                   # App stats & core controllers
│           ├── auth/                  # Guard, middleware (RLS), OTP
│           ├── document/              # Document upload & access control
│           ├── notification/          # Notification dispatch & read status
│           ├── oauth/                 # OAuth authentication
│           ├── prisma/                # Prisma service & RLS context
│           ├── rag/                   # RAG chat & query audit endpoints
│           ├── team/                  # Team & Department management
│           └── users/                 # Employee management & self service
├── Frontend/
│   └── pa-frontend/
│       ├── src/
│       │   ├── app/                   # App Router pages ((dashboard), (web), auth)
│       │   ├── components/            
│       │   │   └── v3/                # Pure React + Tailwind V3 Component Primitives (V3Button, V3Input, V3Select, V3Modal, V3Table, V3Tabs, V3Sidebar, V3Header)
│       │   ├── store/                 # Zustand state (sessionStore, signupStore)
│       │   ├── lib/                   # Utilities & Axios instances
│       │   └── globals.css            # V3 CSS Variables & Indigo Theme Tokens
│       └── package.json
└── V3_PROJECT_CONTEXT.md
```

---

## V3 Pure React + Tailwind Component Suite (`src/components/v3/`)

- `V3Button.tsx`: Pure React button supporting `primary` (Indigo), `secondary`, `outline`, `ghost`, and `danger` variants, size options, and spinner indicators.
- `V3Input.tsx`: Styled input with icon prefixes, focus ring highlights, and validation labels.
- `V3Select.tsx`: Custom select dropdown built with pure React state and Tailwind CSS.
- `V3Modal.tsx`: Pure React portal overlay dialog with backdrop blur, title header, body container, and action footer.
- `V3Table.tsx`: Enterprise table wrapper with sticky headers, striped hover rows, empty state indicators, and pagination controls.
- `V3Tabs.tsx`: Modern tab pill container for toggling views in Documents Vault and Settings.
- `V3Badge.tsx`: Contextual status badges (`active`, `pending`, `banned`, `admin`, `team_lead`).
- `V3Card.tsx` & `V3StatCard.tsx`: Metric summary cards with icon badges and hover shadow elevation.
- `V3Sidebar.tsx`: Left-rail navigation shell with brand header, grouped sections (`WORKSPACE`, `ORGANIZATION`, `SYSTEM`), active route pills, and user profile switcher.
- `V3Header.tsx`: Top header with path breadcrumb trail, notification counter dropdown, and profile menu.

---

## Database Architecture (`schema.prisma`)

### Core Models & Relationships
- `user`: Employees/users with role, tenantId, departmentId, teamId, managerId, status (`active`, `pending`, `not_verified`, `banned`, `deleted`), salary, probation, designation.
- `company`: Tenant company details, domain, industry, employeeSize, userLimit.
- `team`: Teams & Departments (`type`: `team` | `department`), parent-child tree (`parentId`), team leads (`leadId`).
- `document`: File records with Cloudinary publicId, mimeType, uploadedById, employeeId.
- `documentAccess`: Granular document access permissions (`view`, `download`, `manage`) scoped by `user` or `team`.
- `notification`: In-app notification messages linked to user and company tenant.
- `adminAccess`: Role assignments for administrative privileges per company tenant.
- `otp` & `passwordResetToken`: Verification and security tokens.

---

## Retained vs. Removed Features

### Intentionally Retained Features (V2 -> V3)
- Authentication (Login, Google OAuth, OTP, Password Reset)
- Role-based Access Control (RBAC) & Tenant RLS
- Employee Management (Add, Edit, Profiles, Search, Filter, Sort, Pagination, Manager hierarchy)
- Departments & Teams Management (Parent-child hierarchy, Team Lead assignment)
- Visual Organization Chart (Interactive node tree for Company -> Depts -> Teams -> Employees)
- Document Uploads & Access Control (Per user/team/dept permissions)
- Notifications Engine
- AI RAG Chat & Query Audits

### Intentionally Removed Obsolete Content
- Legacy Performance Appraisal & OKR Review Sessions (`model session` with startDate/endDate/cadence)
- Legacy Division Objective model (`model division`, `DivisionModule`, `createObjectiveInsideDivision.ts`)
- Obsolete check-in and performance rating UI components (`DisabledRating.tsx`, `RatingSlider.tsx`, `group-checkin`, `self-checkin`)

---

## How to Run, Build & Test

### Backend (`Backend/pa-backend`)
```bash
# Generate Prisma Client
npx prisma generate

# Typecheck
npx tsc --noEmit

# Production Build
npm run build

# Start Development Server
npm run dev
```

### Frontend (`Frontend/pa-frontend`)
```bash
# Typecheck
npx tsc --noEmit

# Production Build
npm run build

# Start Development Server
npm run dev
```

---

## Instructions for Future Developers & AI Agents
1. **Use Pure React + Tailwind**: Build new UI views using `src/components/v3/` components and direct Tailwind utility classes. Do not introduce third-party UI framework wrappers.
2. **Preserve RLS Context**: When performing raw PostgreSQL queries or transactions in `Backend/pa-backend`, set `app.tenant_id` context via transaction execution.
3. **Maintain Type Safety**: Always run `npx tsc --noEmit` on both frontend and backend before committing structural changes.
