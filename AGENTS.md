
## Invariants
- Conversation in bangla, but technical terms should be in english.
- **Cross-device sync (২০২৬-০৯-১৮)** — IndexedDB (Dexie) সবসময় primary (offline-এ পুরোপুরি কাজ করে); Settings → Database ট্যাবে sync key বসানো থাকলে `src/lib/sync.ts` background-এ dsa_prep_local_company-এর pilot-এর মতো একই শেয়ার্ড Supabase `progress_sync` টেবিলে push/pull করে — এখানে `site_prefix = "leave"`, আর ডেটা `exportDatabaseToJson`/`importDatabaseFromJson`-এর (আগে থেকেই ছিল, backup/restore ফিচারের জন্য বানানো) পুরো blob। Conflict resolution: last-write-wins, `updated_at` দিয়ে। Sync key auth-less — `sync:v1:key` নামে localStorage-এ, workspace-এর dsa_prep/behavioural_interview/switch_in_6_month সাইটগুলোর সাথে origin-শেয়ার্ড (একই key সব জায়গায় কাজ করে, কারণ সবই `sojibrd.github.io`-র আলাদা path)। GitHub Actions build-এ `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` repo secret লাগে।

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
