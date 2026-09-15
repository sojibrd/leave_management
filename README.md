# leave_management — LeaveMaster

কর্মীর নিজের ব্যক্তিগত ছুটি ব্যবস্থাপনার offline-first ওয়েব অ্যাপ। সার্ভার বা ব্যাকএন্ড নেই — সব ডেটা ব্রাউজারের IndexedDB-তে।

**লাইভ:** https://sojibrd.github.io/leave_management/

## Functional Requirement

- **ছুটির আবেদন:** তারিখ, ধরন আর কারণ দিয়ে আবেদন; অবস্থা `Pending` → `Approved` / `Rejected`।
- **কর্মদিবসের হিসাব:** সাপ্তাহিক ছুটি (শুক্র-শনি, শনি-রবি বা কাস্টম) আর সরকারি ছুটি বাদ; অর্ধদিবস (সকাল/বিকেল) = ০.৫ দিন।
- **ব্যালেন্স:** চার ধরন — Casual (CL ১০), Sick (SL ১৪), Annual (AL ১৫), Compensatory (CO ২); বছরশেষে carry forward নেই।
- **ইমেইল নোটিশ:** আবেদন থেকে তৈরি ফরম্যাট করা নোটিশ; `mailto:`-এ খোলা বা clipboard-এ কপি।
- **ছাপার ফর্ম:** A4 ফর্ম, আবেদনকারী, Department Head আর HR-এর সইয়ের ঘর সহ।
- **৫টা ট্যাব:** Dashboard (circular balance card), Calendar (রঙে চিহ্নিত), History, Analytics (নির্বাচিত বছর, pure SVG), Expert Guide (holiday hack, edge case matrix, handover checklist, OOO টেমপ্লেট)।
- **Settings:** কর্মীর তথ্য, প্রাপক (Manager `To:`, HR `Cc:`), সাপ্তাহিক ছুটি, বার্ষিক কোটা, সরকারি ছুটি।
- **Backup/Restore:** পুরো ডেটাবেস JSON-এ export ও import; defaults-এ reset।

## Non-Functional Requirement

- **Offline-first, কোনো ব্যাকএন্ড নেই।** Dexie.js দিয়ে IndexedDB; ২০২৬-এর বাংলাদেশের ছুটি আগে থেকে বসানো।
- **হিসাবের নিয়ম:** Approved আর Pending দুটোই ব্যালেন্স থেকে কাটে, Rejected নয়; overlap যাচাই; বছর পেরোনো ছুটি দুই বছরে ভাগ।
- **কোনো বাইরের chart লাইব্রেরি নয়** — pure SVG।
- **মোবাইল-উপযোগী:** ট্যাব অনুভূমিক স্ক্রল, History ≤৭৬৮px-এ card view, Calendar-এ dot আর tap popover।
- **ডিফল্ট থিম Control Room** (dark, micro-grid, cyan accent)।
- **Static export → GitHub Pages;** basePath আসে `NEXT_PUBLIC_BASE_PATH` থেকে।
- **স্ট্যাক:** Next.js (App Router, `src/`), TypeScript, Dexie.js।

## ডক ইনডেক্স

| ফাইল | Gist |
|---|---|
| [docs/expert-leave-management-guide.md](docs/expert-leave-management-guide.md) | ছুটি ব্যবস্থাপনার প্রামাণ্য নির্দেশিকা: proactive দর্শন; সিস্টেম আর্কিটেকচার ও state machine; ৯টা edge case (overlap, উইকেন্ড সীমা, sandwich rule, বছর পেরোনো, কোটা শেষ/LOP, অর্ধদিবস, backdated, বাতিল ও কোটা ফেরত, মাল্টি-ট্যাব race); কর্মদিবস ও ব্যালেন্সের সূত্র; ২০২৬-এর holiday bridging, handover আর OOO প্রোটোকল |
| [memory.md](memory.md) | শেষ সেশনের নোট (২০২৬-০৯-০৪): কী বানানো হয়েছে (DB, calculator, কম্পোনেন্ট, Expert Guide, Control-Room থিম), নেওয়া সিদ্ধান্ত, বর্তমান অবস্থা, পরের সেশনের শুরু, ভবিষ্যতের আইডিয়া |
| [AGENTS.md](AGENTS.md) | কথোপকথন বাংলায়, technical term ইংরেজিতে; `next dev`-এর বসানো Next.js সতর্কতা |

## প্রজেক্ট-নির্দিষ্ট নিয়ম

- **কোথায় কী:**
  - `src/lib/db.ts` — IndexedDB স্কিমা, seed ও backup/restore।
  - `src/lib/calculator.ts` — কর্মদিবস, `calculateBalances`, `checkLeaveOverlap`, `splitCrossYearLeave`, `findOptimalHolidayBridges`।
  - `src/lib/emailGenerator.ts` — নোটিশের লেখা।
- **ইমেইল স্বাক্ষর:** নাম + পদবি + কোম্পানি; Employee ID বাদ। Subject-এও Employee ID বাদ।
- **মেয়াদ শেষের সতর্কতা:** বাকি ব্যালেন্স > ০ আর বছরশেষের ৯০ দিনের কম বাকি — শুধু চলতি বছরে।
- **ভবিষ্যৎ:** `brainstorming/ASSUMPTIONS.md`-এর Stage 3-এ (২০২৮-১০ → ২০২৯-০৬) এই প্রজেক্ট IndexedDB থেকে Postgres + auth-এ রূপান্তরিত হবে (নতুন প্রজেক্ট নয়)।

## চালানো

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # static export → out/
```
