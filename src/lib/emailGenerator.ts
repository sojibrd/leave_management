import { LeaveRequest, UserSettings } from '../types/leave';
import { formatFriendlyDate, formatFriendlyDateRange } from './calculator';

export interface GeneratedEmailDraft {
  to: string;
  cc: string;
  subject: string;
  body: string;
  mailtoUrl: string;
}

export function generateLeaveEmailDraft(
  leave: LeaveRequest,
  settings: UserSettings
): GeneratedEmailDraft {
  const dateText = leave.startDate === leave.endDate
    ? `${formatFriendlyDate(leave.startDate)} (${leave.isHalfDay ? `Half Day - ${leave.halfDayPeriod === 'first-half' ? 'First Half' : 'Second Half'}` : '1 Day'})`
    : `${formatFriendlyDateRange(leave.startDate, leave.endDate)} (${leave.totalDays} Working Days)`;

  const subject = `Leave Application: ${leave.leaveTypeName} - ${settings.employeeName} (${settings.employeeId})`;

  const to = settings.managerEmail || '';
  const cc = settings.hrEmail || '';

  const backupText = leave.backupPerson
    ? `During my absence, my colleague ${leave.backupPerson}${
        leave.backupContact ? ` (Contact: ${leave.backupContact})` : ''
      } has kindly agreed to handle any urgent deliverables or handovers.`
    : `I have ensured all my pending deliverables are updated and prioritized ahead of my leave.`;

  const body = `Dear ${settings.managerName || 'Manager'},

I am writing to formally request leave of absence from the office.

Leave Details:
- Leave Type: ${leave.leaveTypeName} (${leave.leaveTypeCode})
- Duration: ${dateText}
- Reason: ${leave.reason || 'Personal / Medical reasons'}

${backupText}

I will resume work on ${getReturnDateText(leave.endDate, settings.weekendDays)}. In case of any urgent query, I will remain accessible via mobile phone or email.

I kindly request you to approve my leave application.

Thank you very much for your understanding and support.

Sincerely,
${settings.employeeName}
${settings.designation}
Employee ID: ${settings.employeeId}
${settings.department}
${settings.companyName}`;

  // Construct mailto link
  const encodedTo = encodeURIComponent(to);
  const params: string[] = [];
  if (cc) params.push(`cc=${encodeURIComponent(cc)}`);
  params.push(`subject=${encodeURIComponent(subject)}`);
  params.push(`body=${encodeURIComponent(body)}`);

  const mailtoUrl = `mailto:${encodedTo}?${params.join('&')}`;

  return {
    to,
    cc,
    subject,
    body,
    mailtoUrl
  };
}

/**
 * Approximate return-to-office date (first non-weekend day after end date)
 */
function getReturnDateText(endDateStr: string, weekendDays: number[]): string {
  if (!endDateStr) return 'the next working day';
  const [y, m, d] = endDateStr.split('-').map(Number);
  const nextDate = new Date(y, m - 1, d + 1);

  // If next day is a weekend, advance
  let count = 0;
  while (weekendDays.includes(nextDate.getDay()) && count < 7) {
    nextDate.setDate(nextDate.getDate() + 1);
    count++;
  }

  return formatFriendlyDate(
    `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`
  );
}
