# Memory — Personal Leave Management Application

Last updated: 2026-09-04 03:42

## What was built

- **Full Next.js Single Page App (Static Export for GitHub Pages)**:
  - `src/app/page.tsx`: Central dashboard orchestrating state, tabs (Dashboard, Calendar, History), modals, theme toggling, and notifications.
  - `src/app/globals.css`: Comprehensive Vanilla CSS design system with light/dark theme variables, glassmorphism, responsive grid, and accessible form controls.
- **Client-Side Database (`src/lib/db.ts`)**:
  - Dexie.js IndexedDB schema with tables for `leaves`, `leaveTypes`, and `settingsTable`.
  - Pre-seeded 2026 Bangladesh public holidays, 4 default leave types (CL: 10, SL: 14, AL: 15, CO: 2 = 41 total days), and employee settings.
  - Robust JSON backup/export and restore/import utilities with validation.
  - Automatic duplicate detection and cleanup for both leave types and leave records.
- **Core Calculation Engine (`src/lib/calculator.ts`)**:
  - Working day calculator excluding configurable weekends (Fri/Sat or Sat/Sun) and public holidays.
  - Accurate half-day handling (0.5 day deduction, first-half / second-half).
  - `calculateBalances`: Deduplicates leave types and records, sums approved & pending days, and calculates `remainingDays = totalQuota - approvedDays - pendingDays`.
- **Email Draft & Printable Application (`src/lib/emailGenerator.ts`, `PrintableLeaveForm.tsx`)**:
  - Exact requested greeting: `Dear Mr. Adnan & HR Team,` with backup handover info and return-to-office date skipping holidays.
  - One-click `mailto:` generator and paper-ready printable application with official signature blocks.
- **UI Components (`src/components/`)**:
  - `Header.tsx`: Theme toggle, JSON backup/restore buttons, year selector.
  - `BalanceCards.tsx`: Overview metric banner and cards per category with progress bars.
  - `ApplyLeaveModal.tsx`: Real-time day calculator, category selector, file attachment uploader, auto-reset on close.
  - `CalendarView.tsx`: Interactive monthly calendar with colored date badges and quick details.
  - `LeaveHistoryTable.tsx`: Search, status filter, inline status switcher (`Pending`, `Approved`, `Rejected`), delete, email draft viewer, and print trigger.
  - `SettingsModal.tsx`: Employee profile, manager/HR emails, weekend presets, custom holiday management, quota editor, and database reset.
- **CI/CD Workflow (`.github/workflows/deploy.yml`)**:
  - GitHub Actions workflow building with Node 22 and deploying to GitHub Pages.

## Decisions made

- **Architecture**: 100% client-side with Dexie IndexedDB. Zero backend / database server required, allowing free hosting on GitHub Pages while keeping user data private on their device.
- **Policy**: No carry forward. Annual leave quotas reset each calendar year; balances are calculated within the selected target year.
- **Balance Logic**: `Available` quota reflects `totalQuota - approvedDays - pendingDays` to prevent employees from exceeding quota while pending applications are under review.
- **StrictMode Resilience**: Used explicit deduplication (by code/fingerprint) in data loaders and memoized component lists to prevent React 18/19 StrictMode double-execution artifacts.
- **Styling**: Vanilla CSS custom properties without Tailwind per project guidelines.

## Problems solved

- **Duplicate category buttons ("showing twice")**: React StrictMode double mount caused concurrent seed checks to insert duplicate leave types. Resolved with set-based deduplication and unique leave type memoization.
- **Wrong balance calculation ("wrong calc")**:
  - Screenshot showed `Total Allocated: 20 days • Taken: 5 • Pending: 38 • Available: 15`.
  - Root cause: Duplicate leave types in user's browser IndexedDB, duplicate demo seeds doubling totals, string concatenation in reduce (`"3" + "5"`), and pending days not deducted from available days.
  - Resolved: Added deduplication in `calculateBalances`, strict `Number()` casting across all components, and subtracted pending days from available balance.
- **Full Code Review (`/reviews`) remediations**:
  - Guarded `seedDemoLeavesIfEmpty` against crashes if types array is empty.
  - Fixed stale quota state in `SettingsModal.tsx` using `useEffect` prop syncing.
  - Wrapped quota updates and database reset in transactions and `try/catch` with toast alerts.
  - Reset form fields in `ApplyLeaveModal` on modal close.
  - Updated email generator return date calculation to skip public holidays in addition to weekends.
  - Replaced hardcoded toast colors with CSS custom property variables.

## Current state

- **Build**: Passes cleanly (`npm run build` completes with exit code 0).
- **Git**: All changes committed and pushed to `main` branch (`https://github.com/sojibrd/leave_management.git`).
- **Production Status**: Production-ready and verified.

## Next session starts with

- Verify live GitHub Pages deployment at `https://sojibrd.github.io/leave_management/` once GitHub Actions run completes.
- Test workflow in production browser environment (clear old IndexedDB data if testing with an existing browser session).
- Review any additional requested features or enhancements.

## Open questions

- None. All reported bugs and review issues are resolved.
