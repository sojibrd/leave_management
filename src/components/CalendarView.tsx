'use client';

import React, { useState } from 'react';
import { Holiday, LeaveRequest, UserSettings } from '../types/leave';
import { parseDate, toDateString } from '../lib/calculator';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info } from 'lucide-react';

interface CalendarViewProps {
  leaves: LeaveRequest[];
  settings: UserSettings;
  selectedYear: number;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarView: React.FC<CalendarViewProps> = ({
  leaves,
  settings,
  selectedYear
}) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());
  const [activeDateInfo, setActiveDateInfo] = useState<{
    dateStr: string;
    holiday?: Holiday;
    leaves: LeaveRequest[];
  } | null>(null);

  // Month navigation
  const prevMonth = () => {
    setCurrentMonth((m) => (m === 0 ? 11 : m - 1));
  };
  const nextMonth = () => {
    setCurrentMonth((m) => (m === 11 ? 0 : m + 1));
  };
  const jumpToday = () => {
    setCurrentMonth(today.getMonth());
  };

  // Build calendar matrix
  const daysInMonth = new Date(selectedYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(selectedYear, currentMonth, 1).getDay(); // 0: Sun ... 6: Sat

  const holidayMap = new Map<string, Holiday>();
  settings.customHolidays.forEach((h) => holidayMap.set(h.date, h));

  // Pre-calculate leaves per date string for fast lookup
  const dateLeavesMap = new Map<string, LeaveRequest[]>();

  leaves.forEach((leave) => {
    if (leave.status === 'rejected') return; // Don't highlight rejected on calendar
    const start = parseDate(leave.startDate);
    const end = parseDate(leave.endDate);

    let cur = new Date(start);
    while (cur.getTime() <= end.getTime()) {
      const dStr = toDateString(cur);
      const list = dateLeavesMap.get(dStr) || [];
      list.push(leave);
      dateLeavesMap.set(dStr, list);
      cur.setDate(cur.getDate() + 1);
    }
  });

  return (
    <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
      {/* Calendar Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--primary-subtle)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CalendarIcon size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              {MONTHS[currentMonth]} {selectedYear}
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Interactive monthly schedule & leave distribution
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={prevMonth}
            className="btn btn-secondary btn-icon-only"
            aria-label="Previous Month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={jumpToday}
            className="btn btn-secondary btn-sm"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="btn btn-secondary btn-icon-only"
            aria-label="Next Month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)',
        marginBottom: '1rem',
        flexWrap: 'wrap'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-emerald)' }} />
          Approved Leave
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-amber)' }} />
          Pending Leave
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-purple)' }} />
          Public Holiday
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)' }} />
          Weekend
        </span>
      </div>

      {/* Weekday Grid Headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '4px',
        textAlign: 'center',
        fontWeight: 700,
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        marginBottom: '4px'
      }}>
        {WEEKDAY_HEADERS.map((name, i) => (
          <div key={name} style={{ padding: '0.4rem', color: settings.weekendDays.includes(i) ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
            {name}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '6px'
      }}>
        {/* Leading empty cells */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} style={{ minHeight: '80px', borderRadius: 'var(--radius-md)', opacity: 0.2 }} />
        ))}

        {/* Days of month */}
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const dayNum = idx + 1;
          const date = new Date(selectedYear, currentMonth, dayNum);
          const dateStr = toDateString(date);
          const dayOfWeek = date.getDay();
          const isWeekend = settings.weekendDays.includes(dayOfWeek);
          const holiday = holidayMap.get(dateStr);
          const dayLeaves = dateLeavesMap.get(dateStr) || [];

          const isCurrentToday =
            today.getFullYear() === selectedYear &&
            today.getMonth() === currentMonth &&
            today.getDate() === dayNum;

          return (
            <div
              key={dateStr}
              onClick={() => {
                if (dayLeaves.length > 0 || holiday) {
                  setActiveDateInfo({ dateStr, holiday, leaves: dayLeaves });
                }
              }}
              style={{
                minHeight: '84px',
                padding: '0.4rem 0.5rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isWeekend ? 'var(--bg-surface-subtle)' : 'var(--bg-surface)',
                border: isCurrentToday
                  ? '2px solid var(--primary)'
                  : '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: (dayLeaves.length > 0 || holiday) ? 'pointer' : 'default',
                transition: 'all 0.15s',
                boxShadow: isCurrentToday ? '0 0 10px var(--primary-glow)' : 'none',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  fontSize: '0.8125rem',
                  fontWeight: isCurrentToday ? 800 : 600,
                  color: isCurrentToday ? 'var(--primary)' : isWeekend ? 'var(--text-muted)' : 'var(--text-primary)'
                }}>
                  {dayNum}
                </span>

                {isCurrentToday && (
                  <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--primary)' }}>
                    TODAY
                  </span>
                )}
              </div>

              {/* Badges container inside cell */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                {holiday && (
                  <div
                    title={holiday.name}
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      backgroundColor: 'rgba(139, 92, 246, 0.18)',
                      color: 'var(--accent-purple)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '1px 4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    🎉 {holiday.name}
                  </div>
                )}

                {dayLeaves.map((l, i) => (
                  <div
                    key={`${l.id}-${i}`}
                    title={`${l.leaveTypeName}: ${l.reason}`}
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      backgroundColor: l.status === 'approved' ? 'rgba(16, 185, 129, 0.18)' : 'rgba(245, 158, 11, 0.18)',
                      color: l.status === 'approved' ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '1px 4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px'
                    }}
                  >
                    <span>{l.leaveTypeCode}</span>
                    {l.isHalfDay && <span style={{ opacity: 0.8 }}>(0.5)</span>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Date Details Modal / Popover if clicked */}
      {activeDateInfo && (
        <div className="modal-overlay" onClick={() => setActiveDateInfo(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>
                Details for {activeDateInfo.dateStr}
              </h4>
              <button
                onClick={() => setActiveDateInfo(null)}
                className="btn btn-outline btn-icon-only"
                style={{ borderRadius: '50%' }}
              >
                ✕
              </button>
            </div>

            {activeDateInfo.holiday && (
              <div style={{
                backgroundColor: 'rgba(139, 92, 246, 0.12)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem'
              }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent-purple)' }}>
                  🎉 Official Public Holiday
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  {activeDateInfo.holiday.name}
                </div>
              </div>
            )}

            {activeDateInfo.leaves.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  APPLIED LEAVES
                </div>
                {activeDateInfo.leaves.map((l) => (
                  <div
                    key={l.id}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface-subtle)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                        {l.leaveTypeName} ({l.leaveTypeCode})
                      </span>
                      <span className={`badge badge-${l.status}`}>
                        {l.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      <strong>Reason:</strong> {l.reason}
                    </div>
                    {l.backupPerson && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Handover: {l.backupPerson}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              !activeDateInfo.holiday && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  No leave booked for this date.
                </p>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};
