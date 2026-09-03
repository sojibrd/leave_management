# Memory — Analytics Dashboard + Quota Expiry Warning

Last updated: 2026-09-04 04:32

## What was built

### আগের সেশন থেকে (restore করা)
- Full Next.js app with Dexie.js IndexedDB
- CL/SL/AL/CO leave management
- Holiday Hacks Engine (dynamic, upcoming-only filter)
- Email draft, print form, settings
- `git push` সম্পন্ন (commit: `dae355f`)

### এই সেশনে নতুন যা তৈরি হয়েছে

**1. Quota Expiry Warning System:**
- `src/lib/calculator.ts`: `calculateExpiryWarnings(balances, targetYear)` ফাংশন যোগ
  - Interface: `ExpiryWarning` (leaveTypeCode, remainingDays, daysUntilExpiry, urgencyLevel)
  - Trigger: remaining > 0 AND year-end < 90 দিন বাকি
  - urgencyLevel: `critical` (<30d) | `warning` (30-60d) | `info` (60-90d)
- `src/components/BalanceCards.tsx`: expiry warning amber/red badge প্রতিটি card-এ
  - `selectedYear` prop যোগ
  - critical level-এ pulse animation

**2. Analytics Dashboard (`src/components/AnalyticsView.tsx`) — নতুন ফাইল:**
  - 6টি summary stat cards (Quota/Used/Approved/Pending/Rejected/Remaining)
  - SVG-based monthly bar chart (12 months, current month highlight)
  - SVG donut chart — leave type breakdown by days used
  - Stacked progress bar per leave type (approved + pending segments)
  - কোনো external chart library নেই — pure SVG

**3. Leave Status Tracker:**
**3. Leave Reason Suggestion Chips (এই সেশনে যোগ হয়েছে):**
- `src/lib/leaveExamples.ts`: **[NEW]** প্রতিটি leave type-এর জন্য 10টি real-world reason — CL/SL/AL/CO
- `src/components/ApplyLeaveModal.tsx`:
  - `showSuggestions` state যোগ
  - Reason textarea-র নিচে "💡 See 10 real examples for CL" toggle button
  - Click করলে chips expand, আবার click করলে collapse
  - Chip click করলে reason field replace (তারপর user edit করতে পারে)
  - Selected chip highlighted হয় (primary color border)

  - ইতিমধ্যে বিদ্যমান ছিল: `LeaveStatus` type, DB schema, history table dropdown
  - `ApplyLeaveModal` default status = `'pending'` (আগে থেকেই ছিল)
  - `calculateBalances()` — pending deducts, rejected skip (আগে থেকেই ছিল)

**4. `src/app/page.tsx` আপডেট:**
  - `'analytics'` tab যোগ (5th tab, BarChart2 icon)
  - `<AnalyticsView>` component wire-up
  - `<BalanceCards>` এ `selectedYear` pass

## Decisions made

- **No carry-forward**: সব leave type (CL/SL/AL/CO) December 31-এ expire
- **Expiry warning trigger**: remaining > 0 AND দিন < 90 — current year only
- **Warning placement**: BalanceCards-এ amber/red inline badge
- **Charts**: pure SVG — no Recharts or any external lib
- **Balance rule**: Pending + Approved উভয়ই deduct, Rejected skip

## Problems solved

- Build error থেকে বাঁচতে সব JSX closing bracket সাবধানে করা হয়েছে
- `BalanceCards` এর নতুন `selectedYear` prop backward-compat ছিল না — page.tsx-এ pass করে ঠিক করা

## Current state

- ✅ `npm.cmd run build` exit code 0 — clean build
- ✅ `npm run dev` চলছে localhost:3000
- ✅ 5টি tab: Dashboard, Calendar, History, **Analytics**, Expert Guide
- ✅ Expiry warning: Dec 31-এর 90 দিন আগে থেকে badge দেখাবে
- কোনো known bug নেই

## Next session starts with

কোনো pending কাজ নেই। পরবর্তী feature ডেভেলপারের নতুন request অনুযায়ী শুরু হবে।
`git commit && git push` করা হয়নি এই সেশনে — পরের সেশনে করতে হবে।

## Open questions

- কোনো অমীমাংসিত বিষয় নেই।
- ভবিষ্যতে বিবেচনা করা যেতে পারে: leave approval email notification, year-over-year analytics comparison
