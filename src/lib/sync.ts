'use client';

import { useEffect, useRef, useState } from 'react';
import { getSupabase } from './supabase';
import { exportDatabaseToJson, importDatabaseFromJson } from './db';
import type { LeaveRequest, LeaveType, UserSettings } from '../types/leave';

/**
 * Cross-device sync — dsa_prep_local_company-তে validate করা একই প্যাটার্ন,
 * এই repo-র Dexie/IndexedDB শেপে adapt করা। IndexedDB সবসময় primary (offline-এ
 * পুরোপুরি কাজ করে); sync key বসানো থাকলে background-এ Supabase-এর একই
 * শেয়ার্ড `progress_sync` টেবিলে push/pull হয় — এখানে `site_prefix = "leave"`।
 *
 * Conflict resolution: পুরো backup blob-এর (settings + leaveTypes + leaves)
 * last-write-wins, `updated_at` দিয়ে। Sync key auth-less — `sync:v1:key`
 * নামে, workspace-এর বাকি সাইটের সাথে origin-শেয়ার্ড (একই key সব জায়গায় কাজ করে)।
 *
 * `useSyncKey()` প্লেইন `useState`-ভিত্তিক, dsa_prep-এর `useLocalStorage`-এর
 * মতো cross-instance sync নেই — তাই এটা `page.tsx`-এ **একবারই** ডাকা হয়, আর
 * `key`-টা prop হিসেবে `useCloudSync` আর `SettingsModal` দুই জায়গাতেই যায়।
 * দুই জায়গায় আলাদা `useSyncKey()` ডাকলে একটার key generate করা আরেকটা টের
 * পাবে না (localStorage বদলালেও নিজের React state আপডেট হয় না)।
 */

const SITE_PREFIX = 'leave';
const SYNC_KEY_STORAGE = 'sync:v1:key';
const META_STORAGE = 'leave:v1:meta';
const PUSH_DEBOUNCE_MS = 1500;

export type SyncStatus = 'off' | 'syncing' | 'synced' | 'error';

function readLocal(key: string): string {
  if (typeof window === 'undefined') return '';
  try {
    return window.localStorage.getItem(key) ?? '';
  } catch {
    return '';
  }
}

function writeLocal(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // quota exceeded বা private mode — সাইট আগের মতোই কাজ করবে
  }
}

export function useSyncKey() {
  const [key, setKeyState] = useState<string | null>(() => readLocal(SYNC_KEY_STORAGE) || null);

  const ensureKey = () => {
    const existing = readLocal(SYNC_KEY_STORAGE);
    if (existing) return existing;
    const next = crypto.randomUUID();
    writeLocal(SYNC_KEY_STORAGE, next);
    setKeyState(next);
    return next;
  };

  const setKey = (next: string) => {
    const trimmed = next.trim();
    writeLocal(SYNC_KEY_STORAGE, trimmed);
    setKeyState(trimmed || null);
  };

  return { key, ensureKey, setKey };
}

export function useCloudSync(
  key: string | null,
  deps: { leaves: LeaveRequest[]; leaveTypes: LeaveType[]; settings: UserSettings },
  reload: () => Promise<void>,
): SyncStatus {
  const [status, setStatus] = useState<SyncStatus>('off');
  const pulledKeyRef = useRef<string | null>(null);
  const skipNextPushRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* key বদলালে একবার pull — remote নতুন হলে local overwrite হয় */
  useEffect(() => {
    if (!key) return;
    const supabase = getSupabase();
    if (!supabase) return;

    let cancelled = false;

    (async () => {
      const metaRaw = readLocal(META_STORAGE);
      const localUpdatedAt = metaRaw ? (JSON.parse(metaRaw) as { updatedAt: string }).updatedAt : '';

      const { data, error } = await supabase
        .from('progress_sync')
        .select('data, updated_at')
        .eq('sync_key', key)
        .eq('site_prefix', SITE_PREFIX)
        .maybeSingle();

      if (cancelled) return;
      if (error) {
        setStatus('error');
        return;
      }

      if (data && (!localUpdatedAt || data.updated_at > localUpdatedAt)) {
        skipNextPushRef.current = true;
        await importDatabaseFromJson(JSON.stringify(data.data));
        await reload();
        writeLocal(META_STORAGE, JSON.stringify({ updatedAt: data.updated_at }));
      }

      pulledKeyRef.current = key;
      setStatus('synced');
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  /* local বদল হলে debounce করে push — এই key-এর জন্য pull শেষ না হওয়া পর্যন্ত না */
  const blobKey = JSON.stringify(deps);

  useEffect(() => {
    if (!key || pulledKeyRef.current !== key) return;
    const supabase = getSupabase();
    if (!supabase) return;

    if (skipNextPushRef.current) {
      skipNextPushRef.current = false;
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      (async () => {
        const updatedAt = new Date().toISOString();
        setStatus('syncing');
        const backupJson = await exportDatabaseToJson();
        const { error } = await supabase
          .from('progress_sync')
          .upsert({ sync_key: key, site_prefix: SITE_PREFIX, data: JSON.parse(backupJson), updated_at: updatedAt });
        /* meta শুধু সফল push-এই এগোয় — ব্যর্থ push-কে "synced" ধরে নিলে ভবিষ্যতে আসল remote update pull না-ও হতে পারে */
        if (!error) writeLocal(META_STORAGE, JSON.stringify({ updatedAt }));
        setStatus(error ? 'error' : 'synced');
      })();
    }, PUSH_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [key, blobKey]);

  return key ? status : 'off';
}
