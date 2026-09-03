---
name: ember-recover
description: Ember.js (v6.4, GJS) কোড ভাঙলে বা অদ্ভুত আচরণ করলে fix চাওয়ার আগে ডায়াগনোজ করুন — এটি কোন ফেইলিউর মোড (নির্দিষ্ট বাগ, দূষিত সেশন, নাকি ভুল ভিত্তি), তারপর সঠিক রেসপন্স (টার্গেটেড ফিক্স, হার্ড রিসেট, নাকি রিথিংক)। Ember-এর চেনা রহস্য-পরিবারগুলোর (UI update হচ্ছে না, দুবার fetch, বাসি data, নীরব error, memory leak) সন্দেহভাজন-ম্যাপসহ। সঠিক সমাধান সঠিক ডায়াগনোসিসের ওপর নির্ভর করে।
---

প্রতিটি সমস্যাই বাগ নয়। আবার প্রতিটি বাগের জন্য ডিবাগিং করার প্রয়োজন হয় না।

Ember-এ এর ওপর একটি বাড়তি ফাঁদ আছে: **সবচেয়ে সাধারণ ব্যর্থতাগুলো নীরব।** ভুল জায়গায় mutation, plain array-তে `@tracked`, unbound method — কোনোটাই error ছুঁড়ে না। কোড চলে, console পরিষ্কার, কিন্তু UI বাসি হয়ে বসে থাকে। Error message ধরে খুঁজতে গেলে এই সমস্যাগুলো কখনোই ধরা পড়বে না — লক্ষণ ধরে খুঁজতে হয়।

আর কোনো কিছু ভুল হলে আমাদের সহজাত প্রবৃত্তি হলো ক্রমাগত প্রম্পট করতে থাকা — সমস্যার বিবরণ, fix, আরেকটি ভাঙা ভার্সন, আবার বিবরণ, আবার fix। সেশন দীর্ঘ হয়, কনটেক্সট দূষিত হয়, কোডের মান আরও খারাপ হয়। সমস্যাটি কোডের নয় — সমস্যাটি হলো আপনি কোন ধরনের ফেইলিউরের মুখোমুখি হয়েছেন তা না জানা।

এই স্কিল প্রথমে ফেইলিউরটি ডায়াগনোজ করে। তারপর সঠিক রেসপন্সের পরামর্শ দেয়। এগুলো দুটি আলাদা ধাপ এবং এদের ক্রম পরিবর্তন করা যাবে না।

## ধাপ ১ — কী ভুল হয়েছে তা বর্ণনা করুন

ডেভেলপার সমস্যার বিবরণ দেবেন। অন্য কিছু করার আগে মনোযোগ দিয়ে শুনুন।

জিজ্ঞাসা করুন:

```

Describe what is wrong. Be specific:

* What did you expect to happen?
* What happened instead?
* How many times have you tried to fix it already?
* Is there an error in the console — or is it completely silent?

```

উত্তরটি মনোযোগ দিয়ে পড়ুন। দুটি সংকেত বিশেষভাবে গুরুত্বপূর্ণ:

- **Fix-চেষ্টার সংখ্যা** — এটি জানাবে সমস্যাটি নতুন, নাকি সেশন ইতিমধ্যে ভুল পথে চলে গেছে
- **নীরবতা** — console-এ কোনো error নেই কিন্তু আচরণ ভুল? Ember-এ এটাই সবচেয়ে জোরালো লক্ষণ: প্রথম সন্দেহ **reactivity**

## ধাপ ২ — ফেইলিউর মোড (Failure Mode) শনাক্ত করুন

বিবরণের ওপর ভিত্তি করে নির্ধারণ করুন এটি তিনটি ফেইলিউর মোডের কোনটি।

### ফেইলিউর মোড ১ — একটি নির্দিষ্ট জিনিস ভেঙে গেছে

**লক্ষণসমূহ:**

- সমস্যাটি বিচ্ছিন্ন — একটি component, একটি service, একটি route-এ সীমাবদ্ধ
- প্রজেক্টের বাকি অংশ সঠিকভাবে কাজ করছে
- এটি ঠিক করার প্রথম বা দ্বিতীয় চেষ্টা
- লক্ষণটি স্পষ্ট ও সুনির্দিষ্ট — error থাকুক বা নীরব থাকুক

**এর অর্থ:** এটি একটি সাধারণ বাগ — একটি মূল কারণ (root cause) আছে যা খুঁজে বের করে ঠিক করা সম্ভব। Ember-এ এই মোডের বেশিরভাগ বাগ পাঁচটি চেনা রহস্য-পরিবারের একটিতে পড়ে।

**রেসপন্স:** টার্গেটেড ফিক্স — ধাপ ৩A।

### ফেইলিউর মোড ২ — সেশনটি ভুল পথে চলে গেছে

**লক্ষণসমূহ:**

- একাধিক fix-চেষ্টা পরিস্থিতি আরও খারাপ করেছে বা নতুন সমস্যা এনেছে
- Fix-এর ওপর জোড়াতালি দিয়ে আরও fix — কোড জট পাকিয়ে গেছে
- সেশনের কনটেক্সট ব্যর্থ চেষ্টায় ভরে গেছে
- মূল সমস্যাটি আসলে কী ছিল তা এখন আর স্পষ্ট নয়

**এর অর্থ:** সেশনটি দূষিত। আরও প্রম্পট করলে লাভ নেই — ক্ষতি বাড়বে। পরিষ্কার কনটেক্সটে নতুন করে শুরু করা দরকার।

**রেসপন্স:** হার্ড রিসেট — ধাপ ৩B।

### ফেইলিউর মোড ৩ — ভিত্তিটিই ভুল

**লক্ষণসমূহ:**

- কোড চলছে কিন্তু সম্পূর্ণ ভুল আচরণ করছে — বাগ নয়, পদ্ধতিই ভুল
- আলাদা আলাদা অংশ ঠিক করে লাভ হচ্ছে না, কারণ পুরো অ্যাপ্রোচ ভুল
- Ember-এ এই মোডের ভুল অনুমান প্রায় সবসময় এই চারটির একটি:
  - **ভুল স্তর** — logic যে ঘরে বসেছে সেটা তার ঘরই নয় (component-এ business logic)
  - **ভুল state-মালিক** — state যেখানে জন্মেছে সেখানে নেই (server data component-এ, shared state local-এ)
  - **Service vs Ember Data ভুল** — model-based data service-এ, বা session/cart জোর করে Store-এ
  - **Classic ধারণা** — modern Ember-কে classic Ember-এর নিয়মে বোঝা (observer-মানসিকতা, two-way binding প্রত্যাশা)

**এর অর্থ:** এটি ডিবাগিংয়ের সমস্যা নয়। কোনো কোড লেখার আগে অ্যাপ্রোচ নিয়ে আবার ভাবা দরকার — ভুল পথে আরও ইমপ্লিমেন্টেশন মানে জট আরও কঠিন।

**রেসপন্স:** নতুন করে ভাবা — ধাপ ৩C।

সামনে এগোনোর আগে ডেভেলপারকে জানান:

```

This looks like Failure Mode [1/2/3] — [name].

[এটি কেন এই মোডে পড়েছে — এক বাক্যে।]

Here is how we handle this:

```

## ধাপ ৩A — টার্গেটেড ফিক্স (Targeted Fix)

ফেইলিউর মোড ১-এর জন্য। চক্রটি সবসময় এক: **Hypothesis → Evidence → Root cause → Fix** — অনুমান করুন, প্রমাণ দিয়ে যাচাই করুন, তারপর fix। প্রমাণ ছাড়া fix মানে জুয়া।

### লক্ষণ থেকে সন্দেহভাজনে — Ember রহস্য-ম্যাপ

সংশ্লিষ্ট কোডটুকু পড়ুন (পুরো কোডবেস নয়) এবং লক্ষণটি কোন পরিবারে পড়ে দেখুন। প্রতিটি পরিবারের চেনা সন্দেহভাজন আছে — hypothesis সেখান থেকে শুরু করুন:

**রহস্য ১ — "UI update হচ্ছে না" (নীরব — error নেই):**

| সন্দেহভাজন | প্রমাণ যেভাবে খুঁজবেন |
|---|---|
| Mutation — `.push()`, `.splice()`, nested assign | State বদলানোর জায়গাগুলো পড়ুন — নতুন reference তৈরি হচ্ছে, নাকি জায়গায় বদল? |
| `@tracked items = []` — plain collection | Collection declaration দেখুন — `TrackedArray` কি? |
| Unbound method — `handleClick() {}` | Action-গুলো arrow function কি? `this` কোথায় হারাচ্ছে? |
| Derived value আলাদা state-এ রাখা | দুটি state কি sync-এর ওপর নির্ভর করছে — getter হওয়ার কথা ছিল? |

**রহস্য ২ — "দুবার fetch হচ্ছে / destroy-র পরও চলছে":**

| সন্দেহভাজন | প্রমাণ যেভাবে খুঁজবেন |
|---|---|
| Constructor-এ initial load | Constructor পড়ুন — fetch/load call আছে? (modifier-এ যাওয়ার কথা) |
| Raw `async/await` — ember-concurrency task নয় | Async method-গুলো দেখুন — component destroy হলে কে থামায়? |
| Getter-এ side effect | Getter-গুলো পড়ুন — ভেতরে fetch/set/notify আছে? |

**রহস্য ৩ — "Data বাসি / দুই জায়গায় দুই রকম":**

| সন্দেহভাজন | প্রমাণ যেভাবে খুঁজবেন |
|---|---|
| Dual caching — Store-এর পাশে দ্বিতীয় copy | Service-গুলোতে store data-র local copy রাখা হচ্ছে কি? |
| ব্যর্থ save-এর পর rollback নেই | Catch block-গুলো পড়ুন — `rollbackAttributes()` আছে? isNew record জমছে? |
| N+1 — relationship-এ `include` নেই | Network tab দেখুন — এক list-এর জন্য কতগুলো request যাচ্ছে? |

**রহস্য ৪ — "Error নীরবে হারিয়ে যাচ্ছে":**

| সন্দেহভাজন | প্রমাণ যেভাবে খুঁজবেন |
|---|---|
| `.catch(() => null)` — error গেলা | Catch block-গুলো grep করুন — খালি বা null-return catch আছে? |
| শুধু `console.error`, UI feedback নেই | Error state কি template-এ পৌঁছাচ্ছে? |
| Network error generic-এ চাপা | `TypeError` + 'fetch' আলাদা ধরা হচ্ছে, নাকি সব `UNKNOWN_ERROR`? |
| Undefined reference — helper import করা হয়নি | `try` block-এর ভেতর ব্যবহৃত প্রতিটা bare identifier ফাইলের `import` block-এ আছে কিনা check করুন (`grep "^import"` বনাম action-এর body) — ReferenceError-ও এই একই catch-এ ধরা পড়ে, তাই "response আসছে কিন্তু কিছু হচ্ছে না" symptom-টা API response-এর সমস্যা মনে হতে পারে যখন আসলে কল-টাই কখনো পৌঁছায়নি (`t_20260902172159765`, 2026-09-03 — একই fetch সফল হলেও পরের `navigateToPlayer(...)` লাইন ছিল unimported, catch-এ পড়ে console.error-এ থেমে যাচ্ছিল)। এই check-টা সস্তা এবং প্রথমেই চালানো উচিত — API/data hypothesis-এ যাওয়ার আগে। |

**রহস্য ৫ — "Memory leak / ক্রমশ ধীর":**

| সন্দেহভাজন | প্রমাণ যেভাবে খুঁজবেন |
|---|---|
| `willDestroy`-এ cleanup নেই | Event listener/subscription/interval যোগ হয়েছে কিন্তু সরানো হয়নি? |
| Listener জমছে — বারবার register | Modifier/constructor-এ addEventListener কতবার চলছে? |
| ভারী getter-এ `@cached` নেই | Render-প্রতি কতবার recompute হচ্ছে — মেপে দেখুন, অনুমানে নয় |

### মূল কারণ ঘোষণা করুন

যেকোনো fix-এর আগে root cause স্পষ্টভাবে উল্লেখ করুন — লক্ষণ নয়, কারণ:

```

Root cause: [এটি কেন ঘটছে তার সুনির্দিষ্ট ব্যাখ্যা]

This is different from the symptom because: [ব্যাখ্যা]

```

### সুনির্দিষ্ট ফিক্সের পরামর্শ দিন

Root cause-কে সরাসরি সমাধান করে এমন fix — workaround বা জোড়াতালি নয়:

```

Fix: [কী পরিবর্তন করা প্রয়োজন এবং কেন]

This will resolve the root cause because: [ব্যাখ্যা]

```

কোনো পরিবর্তনের আগে ডেভেলপারের নিশ্চিতকরণের জন্য অপেক্ষা করুন।

### যদি ফিক্সটি কাজ না করে

থামুন। সাথে সাথেই আরেকটি fix-এর পরামর্শ দেবেন না — fix কাজ না করা মানে সম্ভবত root cause ভুল শনাক্ত হয়েছিল। শুরু থেকে নতুন করে ডায়াগনোজ করুন, রহস্য-ম্যাপের অন্য পরিবারেও তাকান।

পরপর দুটি root cause ডায়াগনোসিস ভুল প্রমাণিত হলে — এটি আসলে মোড ২ বা ৩ হতে পারে। পুনর্মূল্যায়ন করুন।

## ধাপ ৩B — হার্ড রিসেট (Hard Reset)

ফেইলিউর মোড ২-এর জন্য।

### পরিস্থিতি সততার সাথে স্বীকার করুন

```

This session has gone too far in the wrong direction
to recover by patching. The right move is a clean start.

This is not a failure — it is the correct response
to a polluted context. A fresh session with clear intent
will be faster than continuing here.

```

### যা রাখার মতো তা সংরক্ষণ করুন

সেশন শেষ করার আগে মূল্যবান যা আছে তা এক্সট্রাক্ট করুন — একটি রিসেট নোটে:

```

## Reset Note — [ফিচার/সমস্যার নাম]

### আমরা কী তৈরি/ঠিক করছিলাম

[মূল কাজের বিবরণ]

### কী ভুল হয়েছে

[সেশনটি কীভাবে ট্র্যাক থেকে সরে গেল — সৎ সারসংক্ষেপ]

### পরবর্তী সময়ে যা এড়িয়ে চলতে হবে

[যে অ্যাপ্রোচ/প্যাটার্নগুলো কাজ করেনি — Ember-এ প্রায়ই: যে fix-গুলো
reactivity-র লক্ষণ ঢাকছিল কিন্তু কারণ ধরছিল না]

### পরবর্তী সেশনের শুরুর বিন্দু

[কোথা থেকে নতুন করে শুরু — কী রাখতে হবে, কী বাদ]

```

### ডেভেলপারকে নির্দেশনা দিন

```

Next steps:

1. Save this reset note somewhere accessible
2. End this session completely
3. Start a fresh session
4. Begin with /remember restore if memory exists
5. Approach [feature name] again with the reset note as context

Do not continue in this session.

```

## ধাপ ৩C — নতুন করে ভাবা (Rethink)

ফেইলিউর মোড ৩-এর জন্য।

### ভুল অনুমানটি চিহ্নিত করুন

ভিত্তি ভুল মানে এমন কিছু ধরে নেওয়া হয়েছিল যা নেওয়া উচিত হয়নি। Ember-এ চারটি চেনা জায়গায় আগে তাকান — ভুল স্তর, ভুল state-মালিক, Service vs Ember Data, classic ধারণা:

```

The core issue is not a bug — it is a wrong assumption:

Assumed: [কী ধরে নেওয়া হয়েছিল]
Reality: [প্রকৃত সত্য — Ember-এ এই জিনিসটা যেভাবে কাজ করে]

This means the current implementation cannot be fixed
by patching. The approach needs to change.

```

### সঠিক অ্যাপ্রোচের প্রস্তাব দিন

```

Correct approach: [বর্ণনা]

Key difference from current approach: [প্রধান পার্থক্য]

What needs to be discarded: [যা বাদ দিতে হবে — উদ্ধারযোগ্য নয়]
What can be kept: [যা এখনও বৈধ]

```

### সাথে সাথেই নতুন করে তৈরি শুরু করবেন না

বিশ্লেষণটি উপস্থাপন করুন এবং নিশ্চিতকরণের জন্য অপেক্ষা করুন:

```

Does this diagnosis match your understanding?

If yes — we can start fresh with the correct approach.
If no — tell me what I am getting wrong.

```

ডেভেলপার নিশ্চিত করার পর — যদি ভুল অনুমানটি স্তর, state-মালিকানা বা Service vs Ember Data সংক্রান্ত হয়, তাহলে নতুন ডিজাইনটি অনুমানে নয়, নিয়ম মেনে হোক: **নতুন সেশনে `/ember-architect` দিয়ে redesign করুন**, এই রিথিংক বিশ্লেষণটিকে input হিসেবে দিয়ে। ছোট অ্যাপ্রোচ-বদলে সরাসরি এখানেই এগোনো যায়।

## মূল নীতি (The Rule)

কোনো কিছু ভেঙে গেলে সবচেয়ে খারাপ যে কাজটি আপনি করতে পারেন তা হলো — একই ভুল কাজ আরও দ্রুত গতিতে করতে থাকা।

প্রথমে ডায়াগনোজ করুন। সঠিকভাবে রেসপন্স করুন। ভিন্ন ফেইলিউরের জন্য ভিন্ন সমাধান — আর আপনি কোন ফেইলিউরের মুখোমুখি তা জানতে পারাটাই সমাধানের অর্ধেকের বেশি।

আর Ember-এর বাড়তি নিয়ম: **error message নেই মানে সমস্যা নেই নয়।** নীরবতাই এখানে সবচেয়ে জোরালো লক্ষণ — console পরিষ্কার অথচ UI ভুল হলে reactivity থেকে খোঁজা শুরু করুন, error-এর অপেক্ষায় বসে থাকবেন না।

**Weak Point Log bridge:** ডায়াগনোসিস শেষে যদি দেখা যায় মূল কারণটি ডেভেলপারের কোনো knowledge gap ছিল — যেমন reactivity-র নিয়ম ভুল বোঝা, ভুল state-মালিক, Service vs Ember Data confusion — `career-preparation`-এর Weak Point Log-এ একটি এন্ট্রি করার কথা মনে করিয়ে দিন (`Date | Problem/Topic | Pattern | Stuck Point | Status`)। একই ভুল দ্বিতীয়বার ডায়াগনোজ করার চেয়ে একবার লগ করা সস্তা।
