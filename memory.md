# Memory — LeaveMaster Personal Leave Management App

Last updated: 2026-09-04 04:58

## What was built

### Core App (আগের সেশন থেকে)
- **Full Next.js Static Export App** (`src/app/page.tsx`, `src/app/globals.css`)
- **Client-Side Database** (`src/lib/db.ts`): Dexie.js IndexedDB, pre-seeded 2026 Bangladesh holidays, 4 leave types (CL:10, SL:14, AL:15, CO:2), JSON backup/restore
- **Core Calculation Engine** (`src/lib/calculator.ts`): working day calc, half-day, `calculateBalances`, `checkLeaveOverlap`, `splitCrossYearLeave`, `findOptimalHolidayBridges`
- **UI Components**: `Header.tsx`, `BalanceCards.tsx`, `ApplyLeaveModal.tsx`, `LeaveHistoryTable.tsx`, `CalendarView.tsx`, `SettingsModal.tsx`, `NotificationToast.tsx`
- **Expert Guide Tab** (`ExpertGuideView.tsx`): Holiday Hacks (dynamic, upcoming-only), Edge Case Matrix, Handover Checklist, OOO Templates

**Control-Room Theme Integration (AI):**
- `src/app/globals.css`: Added deep mission-control palette (`--bg-app: #06090f`, `--bg-surface: #0c121e`, `--primary: #0284c7`, electric cyan `--accent-cyan: #00f0ff`, radar green `--accent-emerald: #10b981`), micro-grid background pattern (`radial-gradient`), HUD-like glow, updated gradient text to electric cyan/blue, updated primary buttons
- `src/app/layout.tsx`: Default `data-theme="control-room"`
- `src/app/page.tsx`: Integrated `'control-room'` theme state and toggle logic
- `src/components/Header.tsx`: Control Room badge, updated theme toggle button with cyan sun icon
- `src/types/leave.ts` & `src/lib/db.ts`: Added `'control-room'` to theme types and default settings

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
- **Default Theme**: Control Room (deep aerospace dark with subtle micro-grid and electric cyan accents)

## Current state

- ✅ `npm run dev` চলছে localhost:3000
- ✅ Production build verified: `npm run build` exited with code 0
- ✅ Full mobile responsive layout across all 5 tabs and 4 modal dialogs
- ✅ Control-Room theme applied as primary theme


## Next session starts with

`git add -A && git commit -m "feat: full mobile responsive layout, touch-friendly navigation, mobile card history view, and compact calendar dots" && git push origin main`
তারপর নতুন feature request অনুযায়ী কাজ শুরু।

## Open questions

- কোনো অমীমাংসিত বিষয় নেই।
- ভবিষ্যতে বিবেচনা করা যেতে পারে: leave approval email notification, year-over-year analytics, user-editable reason suggestions
