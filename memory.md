# Memory — LeaveMaster Personal Leave Management App

Last updated: 2026-09-04 04:58

## What was built

### Core App (আগের সেশন থেকে)
- **Full Next.js Static Export App** (`src/app/page.tsx`, `src/app/globals.css`)
- **Client-Side Database** (`src/lib/db.ts`): Dexie.js IndexedDB, pre-seeded 2026 Bangladesh holidays, 4 leave types (CL:10, SL:14, AL:15, CO:2), JSON backup/restore
- **Core Calculation Engine** (`src/lib/calculator.ts`): working day calc, half-day, `calculateBalances`, `checkLeaveOverlap`, `splitCrossYearLeave`, `findOptimalHolidayBridges`
- **UI Components**: `Header.tsx`, `BalanceCards.tsx`, `ApplyLeaveModal.tsx`, `LeaveHistoryTable.tsx`, `CalendarView.tsx`, `SettingsModal.tsx`, `NotificationToast.tsx`
- **Expert Guide Tab** (`ExpertGuideView.tsx`): Holiday Hacks (dynamic, upcoming-only), Edge Case Matrix, Handover Checklist, OOO Templates

### এই সেশনে তৈরি/পরিবর্তন

**Analytics Dashboard (AI):**
- `src/components/AnalyticsView.tsx` [NEW]: SVG-based monthly bar chart, donut chart by type, stacked progress bars, 6 summary stat cards
- `src/app/page.tsx`: 5th tab "Analytics" (BarChart2 icon), `AnalyticsView` wire-up

**Quota Expiry Warning (AI):**
- `src/lib/calculator.ts`: `calculateExpiryWarnings(balances, targetYear)` — triggers when remaining > 0 AND year-end < 90 days, urgencyLevel: critical/warning/info
- `src/components/BalanceCards.tsx`: `selectedYear` prop যোগ, per-card amber/red expiry badge with pulse animation

**Leave Reason Suggestions (AI):**
- `src/lib/leaveExamples.ts` [NEW]: CL/SL/AL/CO প্রতিটিতে 10টি real-world reason string
- `src/components/ApplyLeaveModal.tsx`: "💡 See 10 real examples for CL" toggle, chip grid, click = replace reason field, collapse on select

**Email Generator fixes (USER):**
- `src/lib/emailGenerator.ts`: greeting → `"Dear Mr. Adnan & HR Team"` (manager name থেকে dynamic), Employee ID & Department email body থেকে বাদ দেওয়া হয়েছে, `getReturnDateText()` এখন holidays-ও skip করে

**Settings Modal fixes (USER):**
- `src/components/SettingsModal.tsx`: `useEffect` দিয়ে settings/leaveTypes prop change sync, Employee ID input field UI থেকে commented out (settings object-এ থাকে)

**DB defaults fix (USER):**
- `src/lib/db.ts`: `employeeName = 'Sojib Das'`, `managerName = 'Mr. Adnan'`, `managerEmail = 'adnan@company.com'`, `settingsTable` type শুদ্ধ করা, `initializeDatabase()` এ full duplicate cleanup logic যোগ

**README (USER):**
- `README.md`: সম্পূর্ণ নতুন করে লেখা — features, setup, configuration guide

## Decisions made

- **No carry-forward**: সব leave type Dec 31 expire
- **Pending deducts balance**: Approved + Pending দুটোই count হয়, Rejected skip
- **Expiry warning**: remaining > 0 AND < 90 days to year-end, current year only
- **Suggestion chips**: click = replace (not append), collapse after selection
- **Email signature**: Name + Designation + Company — Employee ID বাদ
- **Analytics**: Selected year only, pure SVG (no Recharts)
- **Charts**: no external chart library

## Problems solved

- `initializeDatabase()` duplicate leave type bug → full cleanup logic দিয়ে ঠিক করা
- `settingsTable` type `any` ছিল → `UserSettings` typed করা
- `getReturnDateText()` holiday skip করত না → holidays param যোগ
- Email greeting hardcoded ছিল → dynamic `managerName` থেকে

## Current state

- ✅ `npm run dev` চলছে localhost:3000
- ✅ Last known good build: exit code 0 (আগের build)
- ✅ 5 tabs: Dashboard, Calendar, History, Analytics, Expert Guide
- ✅ Leave apply → reason suggestions toggle → chip click → auto-fill
- ✅ Expiry warning badge: Oct থেকে BalanceCards-এ দেখাবে
- ⚠️ `git commit && git push` এই সেশনে করা হয়নি — পরের সেশনে করতে হবে

## Next session starts with

`git add -A && git commit -m "feat: analytics, expiry warnings, reason suggestions, email fixes" && git push origin main`
তারপর নতুন feature request অনুযায়ী কাজ শুরু।

## Open questions

- কোনো অমীমাংসিত বিষয় নেই।
- ভবিষ্যতে বিবেচনা করা যেতে পারে: leave approval email notification, year-over-year analytics, user-editable reason suggestions
