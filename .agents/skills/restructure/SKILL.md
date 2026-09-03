---
name: restructure
description: একটা কম্পোনেন্ট ফোল্ডার যখন সমতল অবস্থায় আর পড়া যায় না (৮+ ফাইল), তখন সেটাকে স্ক্রিন-ফোল্ডারে ভাগ করুন — অথবা একটা ফিচারকে এক লেভেল ওপরে প্রোমোট করুন — code-standards.md-এর নিয়মে, import না ভেঙে, আর মুভটা decisions/*.md-এ লিখে রেখে। ডেভেলপার ফোল্ডার-পাথ দেয়; স্কিল audit → move-plan → execute তিন ধাপে চলে।
---

একটা ফিচার ফোল্ডার সমতল অবস্থায় শুরু হয়। যতক্ষণ পড়া যায় ততক্ষণ সমতলই থাকে। তারপর একটা সময় ফাইলের সংখ্যা এত বেশি হয় যে alphabetical লিস্ট আর নিজের গ্রুপ দেখায় না — পাঠককে আবার ফাইল খুলে দেখতে হয় ভেতরে কী আছে। ঠিক সেই মুহূর্তে ফোল্ডারটা **স্ক্রিন** অনুযায়ী ভাগ হয় (রুট যা render করে), ফাইল-টাইপ অনুযায়ী নয়।

এআই এই ভাগটা প্রতিবার আলাদা ভাবে করে — একবার `modals/`, একবার `api/`, একবার প্রিফিক্স রেখে দেয়, একবার বাদ দেয়, আর প্রায় প্রতিবার কোনো না কোনো import ভাঙে যা build-এ ধরা পড়ে না, শুধু ব্রাউজারে একটা ভুল-দিকে-পাঠানো রুট এরর হিসেবে আসে। এই স্কিল সেই কাজটাকে একটাই নিয়মে, একটাই নিরাপদ ক্রমে বেঁধে দেয়।

এটা `t_20260825152554873`-এ `components/bid/`-কে ৩১টা সমতল ফাইল থেকে ছয়টা স্ক্রিন-ফোল্ডারে ভাগ করার পদ্ধতিটাই কোডবদ্ধ করে — যে দুটো সিদ্ধান্ত ওই মুভটাকে সস্তা বানিয়েছিল (এন্ট্রির নাম `index.gjs`, সত্যিকারের শেয়ার্ড ফাইল রুটে), আর যে একটা বাগ তবু ব্রাউজারে পালিয়েছিল (একটা absolute-path import যা rewrite স্ক্রিপ্ট skip করেছিল)।

---

## যেভাবে ইনভোক করবেন

ডেভেলপার সবসময় টার্গেট ফোল্ডার দেয় — স্কিল নিজে খুঁজে বের করে না:

```

/restructure app/components/tournament

```

একটা ফিচারকে এক লেভেল ওপরে প্রোমোট করতে (যেমন `tournament/bid/` → `components/bid/`):

```

/restructure app/components/tournament/bid --promote-to app/components/bid

```

কোনো পাথ না দিলে — জিজ্ঞাসা করুন, স্ক্যান করবেন না:

```

Which folder should I restructure?

```

---

## এই স্কিল যে নিয়মগুলো প্রয়োগ করে

সবগুলো `docs/context/code-standards.md` § **"Where a Component File Lives / Helper / Modifier"**-এর। এখানে সংক্ষেপ, বিরোধ বাধলে ওই ফাইলই চূড়ান্ত:

1. **৮-এর নিচে → সমতল।** সমস্যার আগে ভাগ কোরো না। ৭ ফাইলের ফোল্ডারে সাব-ফোল্ডার হলো ceremony।
2. **৮ বা তার বেশি → স্ক্রিন-প্রতি একটা ফোল্ডার, এন্ট্রি ফাইলের নাম `index.gjs`।** ভাগটা স্ক্রিন অনুযায়ী — রুট যা render করে — ফাইল-টাইপ অনুযায়ী নয়।
3. **স্ক্রিন-ফোল্ডারের ভেতরে ফোল্ডার যে প্রিফিক্স বহন করে সেটা ফাইলনাম থেকে বাদ।** `dashboard/row.gjs`, `dashboard/dashboard-row.gjs` নয় — import path-এ `dashboard` আগেই আছে।
4. **৩+ স্ক্রিনে ব্যবহৃত ফাইল কোনো স্ক্রিন-ফোল্ডারে থাকে না — ফিচার-রুটে বসে।** স্ক্রিন-ফোল্ডারে রাখলে তার নামটাই মিথ্যা হয়ে যায়।
5. **প্রতি স্ক্রিনের `index.gjs` শুরু হয় ছোট হেডার কমেন্ট দিয়ে** — কোন রুট, আর কোন ফাইলগুলো এই স্ক্রিনের অংশ।
6. **হেল্পার (`.js`) ও মডিফায়ার:** এক কম্পোনেন্ট + ছোট → same-file; এক কম্পোনেন্ট + বড়/অ্যালগরিদমিক → sibling `.js` (একই নাম-পরিবার, `fixture-tab.gjs` + `fixture/generators.js`); দ্বিতীয় ফাইলের দরকার → `app/utils/` বা `app/modifiers/`।
7. **README প্রস্তাব কোরো না।** ফোল্ডার drift করতে পারে না, ডকুমেন্ট পারে — এটাই `index.gjs` হেডারকে বেছে নেওয়ার কারণ।

**লিখিত ছাড় — `tournament/detail/`।** এর `*-tab.gjs` ফাইলগুলো সমতল থাকে: `-tab` সাফিক্স আর `detail/tabs-config.js`-এর `TABS` লিস্ট একই legibility অন্য পথে দেয়। এটা tidy করার ভায়োলেশন নয়। টার্গেটে এমন কোনো লিখিত ছাড় থাকলে (`decisions/*.md`-এ খোঁজো) সেটা সম্মান করো।

---

## ধাপ ১ — Audit

টার্গেট ফোল্ডার পড়ো। শুধু তথ্য সংগ্রহ, কোনো এডিট নয়:

- **প্রতি সাব-ফোল্ডারে ফাইল-কাউন্ট** — কোনটা ৮ পেরিয়েছে, কোনটা এক-ফাইলের ceremony ফোল্ডার।
- **স্ক্রিন সনাক্ত** — `app/routes/` আর `app/templates/`-এর সাথে মিলিয়ে দেখো টার্গেটের কোন ফাইলগুলো আসলে রুট-এন্ট্রি।
- **৩+ স্ক্রিনে ব্যবহৃত ফাইল** — এগুলো ফিচার-রুটে থাকবে। প্রতিটার importer গুনে বের করো।
- **প্রতিটা importer** — `spordium/…` (absolute) **আর** `./…` (relative) দুই ধরনেরই, `components/ templates/ routes/ utils/ controllers/ services/ helpers/ modifiers/` জুড়ে।
- **ownership boundary-বাইরের importer** — `AGENTS.md` § "Code Ownership" অনুযায়ী teams/tournament-এর বাইরের কোনো ফাইল টার্গেটের ভেতর থেকে import করে কিনা।
- **`docs/context/decisions/*.md` ও `ui-registry/*.md`** — টার্গেটের কোনো path আক্ষরিকভাবে লেখা আছে কিনা (মুভ করলে এগুলোও আপডেট করতে হবে; `decisions/*.md`-এ পুরনো path রাখা থাকতে পারে ইতিহাস হিসেবে — সেগুলো ছুঁয়ো না)।

---

## ধাপ ২ — Move-plan (এখানে থামো, কনফার্ম নাও)

একটা প্ল্যান উপস্থাপন করো। **কিছু মুভ কোরো না, কোনো import বদলিও না।** ফরম্যাট:

```
## Restructure plan — [folder]

### Screens found
- [screen] → [N files] → folder `[name]/`, entry `index.gjs`
- ...

### Moves (old → new)
| Old path | New path | Reason |
| --- | --- | --- |
| create/step-5-others/step-5-api.js | create/step-5-others/api.js | prefix drop (rule 3) |
| ... | ... | ... |

### Staying at the feature root
- [file] — used by [N] screens: [list] (rule 4)

### git mv lines (you run these)
```
git -C spordium-web mv <old> <new>
...
```

### Import rewrites (I apply after you run the git mv)
- [N] files: [list]
- absolute + relative both

### Out-of-bounds — reported, NOT edited
- [file outside teams/tournament] imports [target file] — you decide

### Docs to update in the same change
- decisions/[shard].md — move table
- ui-registry/[shard].md — [N] dead paths → new paths

### Verify in the browser after (build/lint/format is yours)
- [route(s) the moved files render] — hard reload each
```

কনফার্ম না পেলে সামনে বেড়ো না। ডেভেলপার প্ল্যান বদলাতে বললে ধাপ ২-এ ফিরে যাও।

---

## ধাপ ৩ — Execute

কনফার্মের পর, **এই ক্রমে** — ক্রমটাই নিরাপত্তা:

1. **`git mv` লাইনগুলো ডেভেলপারকে হ্যান্ড-ওভার করো।** স্কিল নিজে চালায় না — writing git command চালানো হয় না, হ্যান্ড-ওভার হয় (`AGENTS.md` § "Git and the terminal")। `git mv` কেন, `Write` + delete নয়: `git mv` git ইতিহাস ধরে রাখে। ডেভেলপার চালানোর জন্য অপেক্ষা করো।
2. **Import rewrite (`Edit` টুলে, এটা git write নয়)।** প্রতিটা moved ফাইলের প্রতিটা importer-এ — absolute (`spordium/components/...`) **আর** relative (`./...`, `../...`) দুটোই। `dashboard/filters.gjs` একটা absolute path import করত বলেই bid-split-এর বাগটা পালিয়েছিল — শুধু `from './…'` ম্যাচ কোরো না।
3. **প্রতি নতুন স্ক্রিন-ফোল্ডারের `index.gjs`-এ হেডার কমেন্ট** — কোন রুট, কোন ফাইলগুলো এই স্ক্রিনের।
4. **ভেতরের ফাইল থেকে ফোল্ডার-প্রিফিক্স বাদ** (রুল ৩) — এটাও `git mv` লাইনে, ধাপ ১-এর সাথে।

`app/routes/` বা `app/templates/`-এর import যদি টার্গেটে থাকে (`spordium/components/tournament/purchase` ধরনের, যা `/index` দিয়ে resolve হয়), এন্ট্রির নাম `index.gjs` রাখলে সেই path অপরিবর্তিত থাকে — এটাই মুভটাকে সস্তা রাখার মূল কৌশল।

---

## ধাপ ৪ — Safety-sweep

মুভ আর rewrite শেষ হলে, বলার আগে যাচাই করো:

1. **`npm --prefix my-task run registry-check`** — `ui-registry.md` ও শার্ডে কোনো মরা path আছে কিনা (lesson L-011)। read-only, তাই চালানো যায়।
2. **প্রতিটা import specifier ফাইলসিস্টেমে resolve করো** — `components/ templates/ routes/ utils/ controllers/ services/ helpers/ modifiers/` জুড়ে, absolute **আর** relative দুটোই। একটা target আছে ধরা হবে তখনই যখন এর কোনো একটা আছে: `<p>.gjs`, `<p>.js`, `<p>/index.gjs`, `<p>/index.js`। একটাও না মিললে সেটা ভাঙা import — ঠিক করো।
3. **কোনো build/lint/format চালিয়ো না।** ব্রাউজার-যাচাই ডেভেলপারের — কোন রুটগুলো hard-reload করতে হবে তার তালিকা দাও।

---

## ধাপ ৫ — লিখে রাখা (একই change-এ)

কোড শেষ হলে লেখাটা কাজের অংশ (`AGENTS.md` Invariants):

- **matching `docs/context/decisions/*.md` শার্ডে** একটা বুলেট — move-table (old → new path), কী সিদ্ধান্ত, কেন, আর কী ইচ্ছে করে করা হয়নি। শার্ড নতুন হলে তবেই `decisions.md` index-এ এক লাইন।
- **matching `docs/context/ui-registry/*.md` শার্ডে** মরা path গুলো নতুন path-এ আপডেট।
- **নতুন structural রুল উঠলে তবেই `docs/context/code-standards.md` § "Where a Component File Lives"** — নাহলে নয়। রুলটা যদি প্রথম প্রয়োগের সাথে না লেখা হয়, কেউ ওটা বিশ্বাস করে না (bid.md L62)।

---

## এই স্কিল যা করে না

- **নিজে `git mv` চালায় না** — লাইন তৈরি করে, ডেভেলপার চালায়।
- **push বা PR করে না।**
- **ownership boundary-বাইরের ফাইল এডিট করে না** — teams/tournament-এর বাইরের importer রিপোর্ট করে, ছোঁয় না। কাজটা boundary-বাইরের এডিট ছাড়া শেষ না হলে, লেখা শুরুর আগে থামে ও বলে।
- **auto-discovery করে না** — টার্গেট ডেভেলপার দেয়।
- **README তৈরি করে না।**
- **build / lint / format চালায় না, প্রস্তাবও করে না।**
- **সমতল ফোল্ডার ভাগ করে না যদি সেটা ৮-এর নিচে হয়** — সংখ্যাটা arbitrary নয়।

---

## যদি পাথ `docs/context/`-এর হয়

এটা ভিন্ন কাজ — কোড নয়, markdown শার্ড। কম্পোনেন্ট-স্প্লিটের নিয়মগুলো এখানে খাটে না। যা মেনে চলবে:

- `decisions.md` / `ui-registry.md` **index** — index শুধু map, body শার্ডে যায়, index-এ এক লাইন। শার্ডের নাম এলাকা অনুযায়ী (`decisions/teams.md` পাশে `ui-registry/teams.md`)।
- মুভের পরে **`npm --prefix my-task run docs-orphans`** আর **`registry-check`** চালাও।
- full-path citation যেসব `docs/reference/` বা শার্ড থেকে আসে, সেগুলো ঠিক করো — একটা tier একটা পরিমাপ (`docs/README.md`)।

কম্পোনেন্ট-কোডের মতো একই তিন-ফেজ: audit → plan (থামো) → execute + sweep।

---

## মূল নিয়ম

একটা ফোল্ডার ৮ ফাইল পেরোলে `/restructure <path>`। প্ল্যান দেখাও, কনফার্ম নাও, তারপর — `git mv` হ্যান্ড-ওভার, import rewrite দুই ধরনেরই, sweep, তারপর শার্ডে লিখে রাখা।

একটা মুভ যা import ভাঙে তা build-এ ধরা পড়ে না। একটা রুল যা প্রথম প্রয়োগের সাথে লেখা হয় না তা কেউ বিশ্বাস করে না। এই দুটোই এই স্কিলের পুরো কারণ।
