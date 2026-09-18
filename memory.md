# Memory — Cross-device sync via Supabase

Last updated: 2026-09-18

## What was built

- **`src/lib/supabase.ts`** — Supabase client factory; env var না থাকলে `null` (sync silently off, লোকাল IndexedDB আগের মতোই কাজ করে)।
- **`src/lib/sync.ts`** — `useSyncKey()` (localStorage key `sync:v1:key`-এর জন্য get/generate/set) আর `useCloudSync(key, deps, reload)` (pull-on-mount + debounced push-on-change, দুটোই async, `pulledKeyRef`/`skipNextPushRef` দিয়ে race আটকানো)। বিদ্যমান `exportDatabaseToJson`/`importDatabaseFromJson` (backup ফিচারের জন্য আগে থেকে ছিল) পুনর্ব্যবহার করা হয়েছে push/pull payload হিসেবে — নতুন serialization লেখা লাগেনি।
- **`src/app/page.tsx`** — `useSyncKey()` **একবারই** এখানে কল হয় (top-level source of truth), `useCloudSync(syncKey, {leaves, leaveTypes, settings}, loadData)` কল করে `syncStatus` পায়, আর `syncKey`/`ensureSyncKey`/`setSyncKey`/`syncStatus` prop হিসেবে `SettingsModal`-এ যায়।
- **`src/components/SettingsModal.tsx`** — Database ট্যাবে নতুন "Cloud Sync (multi-device)" সেকশন: key দেখা/কপি/generate, "Use my own key" (custom key), "Pair with another device's key"। English UI (অ্যাপের নিজের ভাষা-convention অনুযায়ী, Bangla নয়)।
- **`.github/workflows/deploy.yml`** — build step-এ `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` env var (repo secrets থেকে); দুটো secret `gh secret set` দিয়ে বসানো হয়েছে।
- **`.env.local.example`** — খালি placeholder, কমিট করা (আসল `.env.local` gitignored)।
- **`AGENTS.md`** — sync architecture-এর নোট যোগ।
- Backend: workspace-এর বাকি ৯টা সাইটের সাথে **শেয়ার্ড** একই Supabase project/টেবিল (`progress_sync`), এখানে `site_prefix = "leave"`। বিস্তারিত ডিজাইন root workspace-এর `memory.md`-এ (dsa_prep_local_company pilot থেকে শুরু হওয়া বড় cross-repo কাজের অংশ এই repo)।

## Decisions made

- **Local-first**: IndexedDB (Dexie) সবসময় primary; sync শুধু background layer, অফলাইনে অ্যাপ পুরোপুরি কাজ করে।
- **Whole-blob last-write-wins** — পুরো backup JSON (settings + leaveTypes + leaves) একসাথে sync হয়, `updated_at` দিয়ে conflict resolve; field-level merge নয়।
- **Auth-less sync key** — email/login নেই, key-ই capability; কেউ key জানলে ডেটা দেখতে/বদলাতে পারবে (personal-scale ঝুঁকি হিসেবে গ্রহণযোগ্য ধরা হয়েছে)।
- **`useSyncKey()` একবারই কল হয়, prop দিয়ে ছড়ায়** — নিচের "Problems solved"-এ কারণ ব্যাখ্যা করা আছে।

## Problems solved

- **key generate করলে sync status আপডেট হচ্ছিল না** — `useSyncKey()` `page.tsx` (via `useCloudSync`) আর `SettingsModal.tsx`-এ আলাদা আলাদা কল হতো, প্রতিটার নিজের `useState` — একটাতে key লেখা হলে localStorage বদলায় ঠিকই, কিন্তু অন্যটার React state টের পায় না (dsa_prep সাইটগুলোর `useLocalStorage`-এর মতো cross-instance `useSyncExternalStore` pub/sub এখানে নেই)। Fix: `useSyncKey()` `page.tsx`-এ single source of truth, `key`/`ensureKey`/`setKey` prop হিসেবে `SettingsModal`-এ পাঠানো।
- **ব্যর্থ push local-এ "synced" হিসেবে রেকর্ড হতো** — `writeLocal(META_STORAGE, ...)` upsert-এর ফলাফল না দেখেই কল হতো। Fix: `if (!error)`-এর ভেতরে সরানো।
- **`react-hooks/set-state-in-effect` lint error** — effect body-তে সরাসরি `setState` (এমনকি async callback শুরুর আগে) কল করলেই error। Fix: `useSyncKey`-এর initial state lazy initializer (`useState(() => readLocal(...))`) দিয়ে, effect বাদ দিয়ে।
- এই repo-তে **আগে থেকেই কিছু unrelated lint error ছিল** (`calculator.ts`, `db.ts`, `CalendarView.tsx`, `ExpertGuideView.tsx`, `LeaveHistoryTable.tsx`, `ApplyLeaveModal.tsx`-এ) — নতুন eslint-plugin-react-hooks rule পুরনো কোডে ধরা পড়েছে, এই সেশনের কাজ না, ছোঁয়া হয়নি। `next build` এগুলোতে block করে না (ESLint build-gate না)।

## Current state

- Commit `e56a0c4` push করা হয়েছে, GitHub Actions deploy সফল, লাইভ সাইটে (https://sojibrd.github.io/leave_management/) sync কাজ করছে।
- Real browser (Playwright + system Chrome) + real Supabase দিয়ে end-to-end যাচাই করা: push confirmed (Supabase-এ row দেখা গেছে সঠিক ডেটাসহ), pull confirmed (আলাদা browser context "দ্বিতীয় ডিভাইস" হিসেবে key পেয়ার করে leave records + settings ঠিকমতো এসেছে)।
- Console error শূন্য পুরো টেস্টে।
- `npm install @supabase/supabase-js` করা আছে, `package.json`/`package-lock.json` কমিট করা।

## Next session starts with

কিছু ব্লক করা নেই। sync ফিচার সম্পূর্ণ এবং deployed। নতুন কাজ চাইলে সরাসরি শুরু করা যাবে।

## Open questions

- কোনো অমীমাংসিত বিষয় নেই এই ফিচার নিয়ে।
- (আগের সেশনের) leave approval email notification, year-over-year analytics, user-editable reason suggestions — এখনো বিবেচনাধীন, অগ্রাধিকার নয়।
