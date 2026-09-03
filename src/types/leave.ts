export type LeaveTypeCode = 'CL' | 'SL' | 'AL' | 'ML' | 'PL' | 'CO';

export interface LeaveType {
  id?: number;
  code: LeaveTypeCode | string;
  name: string;
  totalQuota: number;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

export interface LeaveRequest {
  id?: number;
  leaveTypeId: number;
  leaveTypeName: string;
  leaveTypeCode: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  isHalfDay: boolean;
  halfDayPeriod?: 'first-half' | 'second-half';
  totalDays: number;
  reason: string;
  backupPerson?: string;
  backupContact?: string;
  status: LeaveStatus;
  appliedAt: string; // ISO String
  updatedAt: string; // ISO String
  attachments?: LeaveAttachment[];
  rejectionReason?: string;
  notes?: string;
}

export interface Holiday {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  isOptional?: boolean;
}

export interface UserSettings {
  employeeName: string;
  employeeId: string;
  designation: string;
  department: string;
  companyName: string;
  managerName: string;
  managerEmail: string;
  hrEmail: string;
  weekendDays: number[]; // 0: Sunday, 1: Monday, ... 5: Friday, 6: Saturday
  currentYear: number;
  customHolidays: Holiday[];
  theme: 'light' | 'dark' | 'system';
}

export interface LeaveBalanceSummary {
  leaveType: LeaveType;
  totalQuota: number;
  approvedDays: number;
  pendingDays: number;
  remainingDays: number;
  percentageUsed: number;
}
