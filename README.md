# Centralized Multi-Office Visitor Pass Management System

A multi-tenant, role-based Visitor Pass Management Application built for high-volume operations across central and branch office locations.

---

## 🚀 Quick Fullstack Launch Settings

You can launch both the **Backend Node Server (Port 5000)** and **Frontend Vite App (Port 5173)** using any of the following methods:

### Option 1: Double-Click Batch File (Simplest for Windows Users)
Double-click **`start-fullstack.bat`** in the root directory.

### Option 2: VS Code 1-Click Launch (F5)
1. Open the workspace folder in **VS Code**.
2. Press **`F5`** or go to **Run & Debug** panel (`Ctrl+Shift+D`).
3. Select **`Fullstack (Backend + Frontend)`** and click **Play**.

### Option 3: Terminal PowerShell Script
```powershell
.\start-fullstack.ps1
```

### Option 4: Root NPM Scripts
From the root directory `d:\visitorpass`:
```bash
# Start both Backend & Frontend in parallel
npm run dev

# Or run fullstack production start
npm run start:fullstack
```

---

## 🔑 Login Credentials

| Account Name | Username | Password | Role | Privileges |
| :--- | :--- | :--- | :--- | :--- |
| **Global Super Admin** | `superadmin` | `SuperAdmin@2026` | `admin` | Full access to create branch offices, upload custom office logos, configure section lists, and issue user accounts. |
| **GMIDC Head Office** | `GMIDCHO` | `password123` | `user` | GMIDC Head Office Operator account for issuing and printing visitor passes. |

---

## 🏢 Features & Architecture Highlights

1. **Multi-Office Isolation & Custom Branding**:
   - Each office profile maintains independent organization names, logos, regional pass titles, department dropdowns, validity rules, and Devanagari fonts (`DVOT-Surekh`).
2. **Role-Based Access Control (RBAC)**:
   - Operators (`role: 'user'`) are bound to their assigned office location.
   - Settings modification and admin dashboard routes are strictly blocked for non-admin users (`403 Forbidden`).
3. **Dedicated Zero-Data-Loss Database Migration**:
   - Automatic startup migration script ([backend/migrations/migrateMultiOffice.js](file:///d:/visitorpass/backend/migrations/migrateMultiOffice.js)) preserving legacy data into `GMIDCHO`.
4. **Photo Media Storage Engine**:
   - High-resolution visitor photos are saved as static images on disk under `/backend/public/uploads/photos/`, reducing MongoDB BSON document sizes by 95%.
5. **Web Login CAPTCHA**:
   - Interactive Canvas CAPTCHA challenge box preventing automated brute-force attacks on public domains.
6. **Mobile Camera Support**:
   - Touchscreen responsive layout with Front/Rear Camera flip toggle and native mobile camera upload fallback (`capture="environment"`).
7. **Automated Gate PC Lockdown Script**:
   - 1-click PowerShell deployment script ([backend/scripts/LockdownGatePC.ps1](file:///d:/visitorpass/backend/scripts/LockdownGatePC.ps1)) restricting browser access to `https://vp.gmidccsn.in` and blocking local network file shares.
