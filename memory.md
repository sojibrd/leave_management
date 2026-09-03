# Memory — LeaveMaster Personal Leave Management App

Last updated: 2026-09-04 04:58

## What was built

### Core App (আগের সেশন থেকে)
- **Full Next.js Static Export App** (`src/app/page.tsx`, `src/app/globals.css`)
- **Client-Side Database** (`src/lib/db.ts`): Dexie.js IndexedDB, pre-seeded 2026 Bangladesh holidays, 4 leave types (CL:10, SL:14, AL:15, CO:2), JSON backup/restore
- **Core Calculation Engine** (`src/lib/calculator.ts`): working day calc, half-day, `calculateBalances`, `checkLeaveOverlap`, `splitCrossYearLeave`, `findOptimalHolidayBridges`
- **UI Components**: `Header.tsx`, `BalanceCards.tsx`, `ApplyLeaveModal.tsx`, `LeaveHistoryTable.tsx`, `CalendarView.tsx`, `SettingsModal.tsx`, `NotificationToast.tsx`
- **Expert Guide Tab** (`ExpertGuideView.tsx`): Holiday Hacks (dynamic, upcoming-only), Edge Case Matrix, Handover Checklist, OOO Templates

**Full Project Mobile Responsive Overhaul (AI):**
- `src/app/globals.css`: Added `.tabs-scroll-container`, `.responsive-dashboard-grid`, `.responsive-analytics-charts`, `.form-grid-2`, `.desktop-table-view`, `.mobile-cards-view`, `.calendar-cell-pills`, `.calendar-cell-dots`, mobile modal bottom sheets, responsive container padding
- `src/app/page.tsx`: Scrollable tabs nav on mobile, responsive dashboard grid, responsive toast position
- `src/components/Header.tsx`: `.hide-on-mobile` text labels for secondary buttons so action bar fits on mobile screens
- `src/components/BalanceCards.tsx`: `minmax(240px, 1fr)` card grid for mobile devices
- `src/components/CalendarView.tsx`: Compact mobile cells with color-coded circular dots (approved, pending, holiday) + tap-to-view date info modal
- `src/components/LeaveHistoryTable.tsx`: Full desktop table on `>=769px`, touch-friendly mobile card view on `<=768px` with quick status and email/print/delete actions
- `src/components/AnalyticsView.tsx`: Responsive charts grid, 2-column mobile summary metrics
- `src/components/ExpertGuideView.tsx`: Responsive minmax grids (280px) and wrapped switcher pills
- Modals (`ApplyLeaveModal`, `SettingsModal`, `EmailDraftModal`, `PrintableLeaveForm`): Stacked form fields with `.form-grid-2`, flex-wrapped action buttons, responsive signature blocks

## Decisions made

- **No carry-forward**: সব leave type Dec 31 expire
- **Pending deducts balance**: Approved + Pending দুটোই count হয়, Rejected skip
- **Expiry warning**: remaining > 0 AND < 90 days to year-end, current year only
- **Suggestion chips**: click = replace (not append), collapse after selection
- **Email signature**: Name + Designation + Company — Employee ID বাদ
- **Analytics**: Selected year only, pure SVG (no Recharts)
- **Charts**: no external chart library
- **Mobile Navigation**: Horizontal scrollable tab bar with touch momentum
- **Mobile History Table**: Native card view on `<=768px` instead of awkward 6-column horizontal scroll
- **Mobile Calendar**: Dot indicators for leaves & holidays on `<=768px` with tap popover

## Current state

- ✅ `npm run dev` চলছে localhost:3000
- ✅ Production build verified: `npm run build` exited with code 0
- ✅ Full mobile responsive layout across all 5 tabs and 4 modal dialogs
- ⚠️ `git commit && git push` করা বাকি

## Next session starts with

`git add -A && git commit -m "feat: full mobile responsive layout, touch-friendly navigation, mobile card history view, and compact calendar dots" && git push origin main`
তারপর নতুন feature request অনুযায়ী কাজ শুরু।

## Open questions

- কোনো অমীমাংসিত বিষয় নেই।
- ভবিষ্যতে বিবেচনা করা যেতে পারে: leave approval email notification, year-over-year analytics, user-editable reason suggestions
