import { Holiday, LeaveBalanceSummary, LeaveRequest, LeaveType } from '../types/leave';

export interface DayBreakdown {
  date: string; // YYYY-MM-DD
  dayName: string;
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName?: string;
  isWorkingDay: boolean;
}

export interface WorkingDaysCalculation {
  workingDays: number;
  calendarDays: number;
  weekendCount: number;
  holidayCount: number;
  breakdown: DayBreakdown[];
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Format Date object to YYYY-MM-DD string
 */
export function toDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses YYYY-MM-DD safely into Date object at midnight local time
 */
export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Calculate working days between two dates, excluding configured weekends and holidays
 */
export function calculateWorkingDays(
  startDateStr: string,
  endDateStr: string,
  weekendDays: number[] = [5, 6],
  holidays: Holiday[] = [],
  isHalfDay: boolean = false
): WorkingDaysCalculation {
  if (!startDateStr || !endDateStr) {
    return { workingDays: 0, calendarDays: 0, weekendCount: 0, holidayCount: 0, breakdown: [] };
  }

  const start = parseDate(startDateStr);
  const end = parseDate(endDateStr);

  // If start is after end, return 0
  if (start.getTime() > end.getTime()) {
    return { workingDays: 0, calendarDays: 0, weekendCount: 0, holidayCount: 0, breakdown: [] };
  }

  const holidayMap = new Map<string, string>();
  for (const h of holidays) {
    holidayMap.set(h.date, h.name);
  }

  const breakdown: DayBreakdown[] = [];
  let current = new Date(start);
  let weekendCount = 0;
  let holidayCount = 0;
  let workingDays = 0;

  while (current.getTime() <= end.getTime()) {
    const dateStr = toDateString(current);
    const dayOfWeek = current.getDay();
    const isWeekend = weekendDays.includes(dayOfWeek);
    const holidayName = holidayMap.get(dateStr);
    const isHoliday = !!holidayName;

    const isWorking = !isWeekend && !isHoliday;

    if (isWeekend) weekendCount++;
    else if (isHoliday) holidayCount++;

    if (isWorking) {
      workingDays++;
    }

    breakdown.push({
      date: dateStr,
      dayName: DAY_NAMES[dayOfWeek],
      isWeekend,
      isHoliday,
      holidayName,
      isWorkingDay: isWorking
    });

    // Advance 1 day
    current.setDate(current.getDate() + 1);
  }

  const calendarDays = breakdown.length;
  const finalWorkingDays = isHalfDay ? (workingDays > 0 ? 0.5 : 0) : workingDays;

  return {
    workingDays: finalWorkingDays,
    calendarDays,
    weekendCount,
    holidayCount,
    breakdown
  };
}

/**
 * Calculate leave balances for each leave type for a specific year
 * Policy Note: No carry-forward; calculated within the active year
 */
export function calculateBalances(
  leaveTypes: LeaveType[],
  leaves: LeaveRequest[],
  targetYear: number
): LeaveBalanceSummary[] {
  // Deduplicate leave types by code
  const uniqueTypesMap = new Map<string, LeaveType>();
  for (const lt of leaveTypes) {
    if (lt && lt.code && !uniqueTypesMap.has(lt.code)) {
      uniqueTypesMap.set(lt.code, lt);
    }
  }
  const uniqueLeaveTypes = Array.from(uniqueTypesMap.values());

  // Deduplicate leaves by id to avoid double counting
  const uniqueLeavesMap = new Map<number | string, LeaveRequest>();
  for (const l of leaves) {
    const key = l.id !== undefined ? l.id : `${l.leaveTypeCode}-${l.startDate}-${l.endDate}-${l.appliedAt}`;
    if (!uniqueLeavesMap.has(key)) {
      uniqueLeavesMap.set(key, l);
    }
  }
  const uniqueLeaves = Array.from(uniqueLeavesMap.values());

  return uniqueLeaveTypes.map((type) => {
    // Filter leaves for this leave type in the target year
    const typeLeaves = uniqueLeaves.filter((leave) => {
      const matchesCode = leave.leaveTypeCode === type.code;
      const matchesId = leave.leaveTypeId === type.id;
      if (!matchesCode && !matchesId) {
        return false;
      }
      const leaveYear = parseDate(leave.startDate).getFullYear();
      return leaveYear === targetYear;
    });

    const approvedDays = typeLeaves
      .filter((l) => l.status === 'approved')
      .reduce((sum, l) => sum + (Number(l.totalDays) || 0), 0);

    const pendingDays = typeLeaves
      .filter((l) => l.status === 'pending')
      .reduce((sum, l) => sum + (Number(l.totalDays) || 0), 0);

    // Remaining available quota = total quota - approved days - pending days
    const remainingDays = Math.max(0, type.totalQuota - approvedDays - pendingDays);
    const percentageUsed = type.totalQuota > 0
      ? Math.min(100, Math.round(((approvedDays + pendingDays) / type.totalQuota) * 100))
      : 0;

    return {
      leaveType: type,
      totalQuota: type.totalQuota,
      approvedDays,
      pendingDays,
      remainingDays,
      percentageUsed
    };
  });
}

/**
 * Format date for friendly human reading (e.g. "04 Sep 2026")
 */
export function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = parseDate(dateStr);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Format range e.g. "04 Sep 2026 – 08 Sep 2026"
 */
export function formatFriendlyDateRange(startStr: string, endStr: string): string {
  if (!startStr) return '';
  if (!endStr || startStr === endStr) return formatFriendlyDate(startStr);
  return `${formatFriendlyDate(startStr)} – ${formatFriendlyDate(endStr)}`;
}

export interface OverlapCheckResult {
  hasConflict: boolean;
  conflictReason?: string;
  conflictingLeave?: LeaveRequest;
}

/**
 * Checks whether a proposed leave date range and half-day configuration
 * collides with any existing Approved or Pending leave requests.
 */
export function checkLeaveOverlap(
  newStartDate: string,
  newEndDate: string,
  newIsHalfDay: boolean,
  newHalfDayPeriod: 'first-half' | 'second-half' = 'first-half',
  existingLeaves: LeaveRequest[] = [],
  ignoreLeaveId?: number
): OverlapCheckResult {
  if (!newStartDate || !newEndDate) {
    return { hasConflict: false };
  }

  const newStart = parseDate(newStartDate).getTime();
  const newEnd = parseDate(newIsHalfDay ? newStartDate : newEndDate).getTime();

  // Only check leaves that are approved or pending
  const activeLeaves = existingLeaves.filter(
    (l) => (l.status === 'approved' || l.status === 'pending') && l.id !== ignoreLeaveId
  );

  for (const leave of activeLeaves) {
    const leaveStart = parseDate(leave.startDate).getTime();
    const leaveEnd = parseDate(leave.isHalfDay ? leave.startDate : leave.endDate).getTime();

    // Check if date intervals overlap: (StartA <= EndB) and (EndA >= StartB)
    const isDateOverlap = newStart <= leaveEnd && newEnd >= leaveStart;

    if (isDateOverlap) {
      // Sub-day granularity logic:
      // If both are single-day half-days on the EXACT same day, they only conflict if they share the same period
      const isBothSingleDay = newStart === newEnd && leaveStart === leaveEnd;
      if (isBothSingleDay && newIsHalfDay && leave.isHalfDay) {
        if (newHalfDayPeriod === leave.halfDayPeriod) {
          return {
            hasConflict: true,
            conflictReason: `You already have a ${leave.status} ${leave.leaveTypeName || leave.leaveTypeCode} (${leave.halfDayPeriod === 'first-half' ? 'First Half / Morning' : 'Second Half / Afternoon'}) on ${formatFriendlyDate(newStartDate)}.`,
            conflictingLeave: leave
          };
        }
        // Different half of the same day: allowed!
        continue;
      }

      // In all other cases where dates overlap, it is a hard collision
      const formattedRange = formatFriendlyDateRange(leave.startDate, leave.isHalfDay ? leave.startDate : leave.endDate);
      return {
        hasConflict: true,
        conflictReason: `Conflicts with an existing ${leave.status.toUpperCase()} leave (${leave.leaveTypeName || leave.leaveTypeCode}: ${formattedRange}).`,
        conflictingLeave: leave
      };
    }
  }

  return { hasConflict: false };
}

export interface YearPartition {
  year: number;
  startDate: string;
  endDate: string;
}

/**
 * Splits a leave spanning across year boundaries into separate yearly partitions
 */
export function splitCrossYearLeave(startDateStr: string, endDateStr: string): YearPartition[] {
  if (!startDateStr || !endDateStr) return [];
  const start = parseDate(startDateStr);
  const end = parseDate(endDateStr);
  if (start.getTime() > end.getTime()) return [];

  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  if (startYear === endYear) {
    return [{ year: startYear, startDate: startDateStr, endDate: endDateStr }];
  }

  const partitions: YearPartition[] = [];
  for (let y = startYear; y <= endYear; y++) {
    const partitionStart = y === startYear ? startDateStr : `${y}-01-01`;
    const partitionEnd = y === endYear ? endDateStr : `${y}-12-31`;
    partitions.push({
      year: y,
      startDate: partitionStart,
      endDate: partitionEnd
    });
  }

  return partitions;
}
