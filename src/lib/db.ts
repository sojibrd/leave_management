import Dexie, { type EntityTable } from 'dexie';
import { LeaveRequest, LeaveType, UserSettings, Holiday } from '../types/leave';

/* Category colours match the control-room category-lamp set (system_design_local_company) —
   distinct signal colours read against the warm chassis without any of them
   needing to be the accent amber. */
export const DEFAULT_LEAVE_TYPES: Omit<LeaveType, 'id'>[] = [
  {
    code: 'CL',
    name: 'Casual Leave',
    totalQuota: 10,
    color: '#62a0dd',
    bgColor: 'rgba(98, 160, 221, 0.12)',
    borderColor: 'rgba(98, 160, 221, 0.35)',
    description: 'For unforeseen personal urgent matters, travel, or family duties.'
  },
  {
    code: 'SL',
    name: 'Sick Leave',
    totalQuota: 14,
    color: '#e05646',
    bgColor: 'rgba(224, 86, 70, 0.12)',
    borderColor: 'rgba(224, 86, 70, 0.35)',
    description: 'For illness, doctor appointments, or medical recovery.'
  },
  {
    code: 'AL',
    name: 'Annual / Earned Leave',
    totalQuota: 15,
    color: '#52c07a',
    bgColor: 'rgba(82, 192, 122, 0.12)',
    borderColor: 'rgba(82, 192, 122, 0.35)',
    description: 'Planned vacations, extended breaks, and rest.'
  },
  {
    code: 'CO',
    name: 'Compensatory Leave',
    totalQuota: 2,
    color: '#a97ad6',
    bgColor: 'rgba(169, 122, 214, 0.12)',
    borderColor: 'rgba(169, 122, 214, 0.35)',
    description: 'Time off in lieu of working weekends or holidays.'
  }
];

export const DEFAULT_HOLIDAYS_2026: Holiday[] = [
  { id: 'h1', date: '2026-01-01', name: "New Year's Day" },
  { id: 'h2', date: '2026-02-21', name: 'International Mother Language Day' },
  { id: 'h3', date: '2026-03-26', name: 'Independence Day' },
  { id: 'h4', date: '2026-04-14', name: 'Bengali New Year (Pohela Boishakh)' },
  { id: 'h5', date: '2026-05-01', name: 'May Day' },
  { id: 'h6', date: '2026-12-16', name: 'Victory Day' },
  { id: 'h7', date: '2026-12-25', name: 'Christmas Day' },
];

export const DEFAULT_SETTINGS: UserSettings = {
  employeeName: 'Sojib Das',
  employeeId: 'EMP-1042',
  designation: 'Software Engineer',
  department: 'Product & Engineering',
  companyName: 'Acme Technologies Ltd.',
  managerName: 'Mr. Adnan',
  managerEmail: 'adnan@company.com',
  hrEmail: 'hr@company.com',
  weekendDays: [5, 6], // Friday & Saturday
  currentYear: new Date().getFullYear(),
  customHolidays: DEFAULT_HOLIDAYS_2026,
  theme: 'control-room'
};

// Define Dexie Database
export class LeaveDatabase extends Dexie {
  leaves!: EntityTable<LeaveRequest, 'id'>;
  leaveTypes!: EntityTable<LeaveType, 'id'>;
  settingsTable!: EntityTable<{ key: string; value: UserSettings }, 'key'>;

  constructor() {
    super('PersonalLeaveManagementDB');
    this.version(1).stores({
      leaves: '++id, leaveTypeId, leaveTypeCode, startDate, endDate, status, appliedAt',
      leaveTypes: '++id, code, name',
      settingsTable: 'key'
    });
  }
}

export const db = new LeaveDatabase();

/**
 * Seed the two demo leave records if the DB has none yet.
 */
export async function seedDemoLeavesIfEmpty(): Promise<void> {
  const count = await db.leaves.count();
  if (count !== 0) return;

  const types = await db.leaveTypes.toArray();
  // Guard: if no types seeded yet, skip — avoids crash
  if (types.length < 2) return;
  const cl = types.find((t) => t.code === 'CL') || types[0];
  const sl = types.find((t) => t.code === 'SL') || types[1];
  if (!cl || !sl) return;

  const currentYearStr = String(new Date().getFullYear());

  await db.leaves.add({
    leaveTypeId: cl.id!,
    leaveTypeName: cl.name,
    leaveTypeCode: cl.code,
    startDate: `${currentYearStr}-02-15`,
    endDate: `${currentYearStr}-02-16`,
    isHalfDay: false,
    totalDays: 2,
    reason: 'Attending sibling wedding ceremony in hometown',
    backupPerson: 'Rafiqul Islam',
    backupContact: 'rafiq@company.com',
    status: 'approved',
    appliedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString()
  });

  await db.leaves.add({
    leaveTypeId: sl.id!,
    leaveTypeName: sl.name,
    leaveTypeCode: sl.code,
    startDate: `${currentYearStr}-03-10`,
    endDate: `${currentYearStr}-03-10`,
    isHalfDay: true,
    halfDayPeriod: 'second-half',
    totalDays: 0.5,
    reason: 'Dental checkup and routine consultation',
    backupPerson: 'Tanvir Ahmed',
    status: 'approved',
    appliedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString()
  });
}

/**
 * Initialize and seed initial data if DB is empty.
 *
 * Single-flighted via `initPromise`: `page.tsx`'s mount effect can run twice
 * back-to-back (React StrictMode dev double-invoke), and without this guard
 * two concurrent runs each see "not seeded yet" and both insert — doubling
 * every default leave type and demo leave. The promise is cleared once
 * settled, so a later legitimate call (e.g. after a cloud-sync pull) still
 * re-runs the cleanup pass on whatever was just imported.
 */
let initPromise: Promise<void> | null = null;

export function initializeDatabase(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (initPromise) return initPromise;
  initPromise = runInitializeDatabase().finally(() => {
    initPromise = null;
  });
  return initPromise;
}

async function runInitializeDatabase(): Promise<void> {
  // Cleanup any duplicates if strict mode or past runs created them
  const existingList = await db.leaveTypes.toArray();
  const seenCodes = new Set<string>();
  const duplicateIds: number[] = [];

  for (const item of existingList) {
    if (seenCodes.has(item.code)) {
      if (item.id) duplicateIds.push(item.id);
    } else {
      seenCodes.add(item.code);
    }
  }

  if (duplicateIds.length > 0) {
    await db.leaveTypes.bulkDelete(duplicateIds);
  }

  // Ensure all 4 default leave types exist without duplicates
  for (const lt of DEFAULT_LEAVE_TYPES) {
    if (!seenCodes.has(lt.code)) {
      const exists = await db.leaveTypes.where('code').equals(lt.code).first();
      if (!exists) {
        await db.leaveTypes.add(lt as LeaveType);
        seenCodes.add(lt.code);
      }
    }
  }

  // Cleanup duplicate leaves in db.leaves if any
  const allLeaves = await db.leaves.toArray();
  const seenLeaves = new Set<string>();
  const duplicateLeaveIds: number[] = [];
  for (const l of allLeaves) {
    const key = `${l.leaveTypeCode}-${l.startDate}-${l.endDate}-${l.totalDays}-${l.status}-${l.reason?.trim()}`;
    if (seenLeaves.has(key)) {
      if (l.id) duplicateLeaveIds.push(l.id);
    } else {
      seenLeaves.add(key);
    }
  }
  if (duplicateLeaveIds.length > 0) {
    await db.leaves.bulkDelete(duplicateLeaveIds);
  }

  const existingSettings = await db.settingsTable.get('user_settings');
  if (!existingSettings) {
    await db.settingsTable.put({
      key: 'user_settings',
      value: DEFAULT_SETTINGS
    });
  }

  await seedDemoLeavesIfEmpty();
}

/**
 * Get user settings
 */
export async function getSettings(): Promise<UserSettings> {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  const entry = await db.settingsTable.get('user_settings');
  if (!entry) {
    return DEFAULT_SETTINGS;
  }
  return { ...DEFAULT_SETTINGS, ...entry.value };
}

/**
 * Save user settings
 */
export async function saveSettings(settings: UserSettings): Promise<void> {
  if (typeof window === 'undefined') return;
  await db.settingsTable.put({
    key: 'user_settings',
    value: settings
  });
}

/**
 * Export all data to JSON
 */
export async function exportDatabaseToJson(): Promise<string> {
  const leaves = await db.leaves.toArray();
  const leaveTypes = await db.leaveTypes.toArray();
  const settings = await getSettings();

  const backupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    settings,
    leaveTypes,
    leaves
  };

  return JSON.stringify(backupData, null, 2);
}

/**
 * Import data from JSON
 */
export async function importDatabaseFromJson(jsonContent: string): Promise<{ success: boolean; message: string }> {
  try {
    const data = JSON.parse(jsonContent);
    if (!data.leaveTypes || !data.leaves || !data.settings) {
      return { success: false, message: 'Invalid backup file structure.' };
    }

    await db.transaction('rw', db.leaves, db.leaveTypes, db.settingsTable, async () => {
      await db.leaves.clear();
      await db.leaveTypes.clear();

      for (const lt of data.leaveTypes) {
        await db.leaveTypes.add(lt);
      }
      for (const leave of data.leaves) {
        await db.leaves.add(leave);
      }
      await db.settingsTable.put({
        key: 'user_settings',
        value: data.settings
      });
    });

    return { success: true, message: 'Data restored successfully!' };
  } catch (err: any) {
    return { success: false, message: `Import error: ${err?.message || 'Unknown error'}` };
  }
}
