import Dexie, { type EntityTable } from 'dexie';
import { LeaveRequest, LeaveType, UserSettings, Holiday } from '../types/leave';

export const DEFAULT_LEAVE_TYPES: Omit<LeaveType, 'id'>[] = [
  {
    code: 'CL',
    name: 'Casual Leave',
    totalQuota: 10,
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.12)',
    borderColor: 'rgba(59, 130, 246, 0.35)',
    description: 'For unforeseen personal urgent matters, travel, or family duties.'
  },
  {
    code: 'SL',
    name: 'Sick Leave',
    totalQuota: 14,
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.35)',
    description: 'For illness, doctor appointments, or medical recovery.'
  },
  {
    code: 'AL',
    name: 'Annual / Earned Leave',
    totalQuota: 15,
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
    description: 'Planned vacations, extended breaks, and rest.'
  },
  {
    code: 'CO',
    name: 'Compensatory Leave',
    totalQuota: 2,
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.12)',
    borderColor: 'rgba(139, 92, 246, 0.35)',
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
  employeeName: 'Mohammad Sojib',
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
  theme: 'dark'
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
 * Initialize and seed initial data if DB is empty
 */
export async function initializeDatabase(): Promise<void> {
  if (typeof window === 'undefined') return;

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
