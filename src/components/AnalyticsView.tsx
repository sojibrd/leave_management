'use client';

import React, { useMemo } from 'react';
import { LeaveRequest, LeaveType, LeaveBalanceSummary } from '../types/leave';
import { parseDate } from '../lib/calculator';
import { BarChart2, TrendingUp, CheckCircle2, Clock, XCircle, Calendar } from 'lucide-react';

interface AnalyticsViewProps {
  leaves: LeaveRequest[];
  leaveTypes: LeaveType[];
  balances: LeaveBalanceSummary[];
  selectedYear: number;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  leaves,
  leaveTypes,
  balances,
  selectedYear
}) => {
  // Filter leaves for selected year
  const yearLeaves = useMemo(
    () => leaves.filter((l) => parseDate(l.startDate).getFullYear() === selectedYear && l.status !== 'rejected'),
    [leaves, selectedYear]
  );

  // Monthly breakdown: days per month
  const monthlyData = useMemo(() => {
    const data = Array.from({ length: 12 }, (_, i) => ({ month: i, days: 0, count: 0 }));
    for (const l of yearLeaves) {
      const m = parseDate(l.startDate).getMonth();
      data[m].days += Number(l.totalDays) || 0;
      data[m].count += 1;
    }
    return data;
  }, [yearLeaves]);

  const maxMonthDays = useMemo(() => Math.max(...monthlyData.map((d) => d.days), 1), [monthlyData]);

  // Leave type breakdown
  const typeBreakdown = useMemo(() => {
    const map = new Map<string, { type: LeaveType; days: number; count: number }>();
    for (const lt of leaveTypes) {
      map.set(lt.code, { type: lt, days: 0, count: 0 });
    }
    for (const l of yearLeaves) {
      const entry = map.get(l.leaveTypeCode);
      if (entry) {
        entry.days += Number(l.totalDays) || 0;
        entry.count += 1;
      }
    }
    return Array.from(map.values()).filter((e) => e.days > 0);
  }, [yearLeaves, leaveTypes]);

  const totalDaysUsed = useMemo(() => yearLeaves.reduce((s, l) => s + (Number(l.totalDays) || 0), 0), [yearLeaves]);
  const totalApproved = useMemo(() => yearLeaves.filter((l) => l.status === 'approved').reduce((s, l) => s + (Number(l.totalDays) || 0), 0), [yearLeaves]);
  const totalPending = useMemo(() => yearLeaves.filter((l) => l.status === 'pending').reduce((s, l) => s + (Number(l.totalDays) || 0), 0), [yearLeaves]);
  const totalRejected = useMemo(() => leaves.filter((l) => parseDate(l.startDate).getFullYear() === selectedYear && l.status === 'rejected').reduce((s, l) => s + (Number(l.totalDays) || 0), 0), [leaves, selectedYear]);
  const totalQuota = useMemo(() => balances.reduce((s, b) => s + b.totalQuota, 0), [balances]);
  const totalRemaining = useMemo(() => balances.reduce((s, b) => s + b.remainingDays, 0), [balances]);

  // Donut chart calculations
  const DONUT_R = 60;
  const DONUT_CX = 80;
  const DONUT_CY = 80;
  const DONUT_STROKE = 20;
  const circumference = 2 * Math.PI * DONUT_R;

  const donutSegments = useMemo(() => {
    if (totalDaysUsed === 0) return [];
    let cumulative = 0;
    return typeBreakdown.map((entry) => {
      const fraction = entry.days / totalDaysUsed;
      const offset = circumference - fraction * circumference;
      const rotate = (cumulative / totalDaysUsed) * 360;
      cumulative += entry.days;
      return { ...entry, fraction, offset, rotate };
    });
  }, [typeBreakdown, totalDaysUsed, circumference]);

  // Busiest month
  const busiestMonth = useMemo(() => {
    const max = monthlyData.reduce((a, b) => (b.days > a.days ? b : a), monthlyData[0]);
    return max.days > 0 ? MONTH_NAMES_FULL[max.month] : null;
  }, [monthlyData]);

  // Today's month index for highlighting
  const todayMonth = new Date().getFullYear() === selectedYear ? new Date().getMonth() : -1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          Leave Analytics — {selectedYear}
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Usage patterns, monthly trends, and leave type breakdown for the selected year.
        </p>
      </div>

      {/* Top Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
        {[
          { label: 'Total Quota', value: totalQuota, unit: 'days', icon: <Calendar size={18} />, color: 'var(--primary)', bg: 'var(--primary-subtle)' },
          { label: 'Days Used', value: totalDaysUsed, unit: 'days', icon: <TrendingUp size={18} />, color: 'var(--accent-emerald)', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Approved', value: totalApproved, unit: 'days', icon: <CheckCircle2 size={18} />, color: 'var(--accent-emerald)', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Pending', value: totalPending, unit: 'days', icon: <Clock size={18} />, color: 'var(--accent-amber)', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Rejected', value: totalRejected, unit: 'days', icon: <XCircle size={18} />, color: 'var(--accent-rose)', bg: 'rgba(239,68,68,0.1)' },
          { label: 'Remaining', value: totalRemaining, unit: 'days', icon: <BarChart2 size={18} />, color: 'var(--primary)', bg: 'var(--primary-subtle)' },
        ].map((card) => (
          <div key={card.label} className="glass-card" style={{ padding: '0.875rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', backgroundColor: card.bg, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {card.icon}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{card.label}</span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: card.color, lineHeight: 1 }}>
              {card.value}
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '0.25rem' }}>{card.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="responsive-analytics-charts">

        {/* Monthly Bar Chart */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>Monthly Leave Usage</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Days taken per month {busiestMonth ? `· Busiest: ${busiestMonth}` : '· No leaves yet'}
            </p>
          </div>

          {/* Bar Chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '160px', padding: '0 4px' }}>
            {monthlyData.map((d) => {
              const heightPct = maxMonthDays > 0 ? (d.days / maxMonthDays) * 100 : 0;
              const isToday = d.month === todayMonth;
              const isEmpty = d.days === 0;
              return (
                <div
                  key={d.month}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}
                  title={`${MONTH_NAMES_FULL[d.month]}: ${d.days} days (${d.count} application${d.count !== 1 ? 's' : ''})`}
                >
                  {/* Value label */}
                  {d.days > 0 && (
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>{d.days}</span>
                  )}

                  {/* Bar */}
                  <div
                    style={{
                      width: '100%',
                      height: isEmpty ? '4px' : `${Math.max(heightPct, 4)}%`,
                      borderRadius: '4px 4px 0 0',
                      backgroundColor: isEmpty
                        ? 'var(--bg-surface-subtle)'
                        : isToday
                        ? 'var(--accent-amber)'
                        : 'var(--primary)',
                      opacity: isEmpty ? 0.4 : 1,
                      transition: 'height 0.4s ease-out, background-color 0.2s',
                      cursor: d.days > 0 ? 'pointer' : 'default',
                      boxShadow: !isEmpty ? '0 0 8px rgba(255,176,32,0.3)' : 'none'
                    }}
                  />

                  {/* Month Label */}
                  <span style={{
                    fontSize: '0.6rem',
                    color: isToday ? 'var(--accent-amber)' : 'var(--text-muted)',
                    fontWeight: isToday ? 700 : 500,
                    whiteSpace: 'nowrap'
                  }}>
                    {MONTH_NAMES[d.month]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--border-subtle)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--primary)', display: 'inline-block' }} />
              Leave days
            </span>
            {todayMonth >= 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--accent-amber)', display: 'inline-block' }} />
                Current month
              </span>
            )}
          </div>
        </div>

        {/* Donut Chart — Leave Type Breakdown */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>Leave Type Breakdown</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Distribution of days used by type</p>
          </div>

          {totalDaysUsed === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '180px', color: 'var(--text-muted)', gap: '0.5rem' }}>
              <BarChart2 size={36} style={{ opacity: 0.3 }} />
              <span style={{ fontSize: '0.8125rem' }}>No leave data for {selectedYear}</span>
            </div>
          ) : (
            <>
              {/* SVG Donut */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <svg width="160" height="160" viewBox="0 0 160 160">
                  {/* Background circle */}
                  <circle
                    cx={DONUT_CX}
                    cy={DONUT_CY}
                    r={DONUT_R}
                    fill="none"
                    stroke="var(--bg-surface-subtle)"
                    strokeWidth={DONUT_STROKE}
                  />

                  {/* Segments */}
                  {donutSegments.map((seg, i) => (
                    <circle
                      key={seg.type.code}
                      cx={DONUT_CX}
                      cy={DONUT_CY}
                      r={DONUT_R}
                      fill="none"
                      stroke={seg.type.color}
                      strokeWidth={DONUT_STROKE}
                      strokeDasharray={`${seg.fraction * circumference} ${circumference}`}
                      strokeDashoffset={0}
                      transform={`rotate(${seg.rotate - 90} ${DONUT_CX} ${DONUT_CY})`}
                      style={{ transition: 'stroke-dasharray 0.5s ease-out' }}
                    />
                  ))}

                  {/* Center text */}
                  <text x={DONUT_CX} y={DONUT_CY - 6} textAnchor="middle" style={{ fontSize: '1.5rem', fontWeight: 800, fill: 'var(--text-primary)' }}>
                    {totalDaysUsed}
                  </text>
                  <text x={DONUT_CX} y={DONUT_CY + 12} textAnchor="middle" style={{ fontSize: '0.6rem', fill: 'var(--text-muted)' }}>
                    days used
                  </text>
                </svg>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {typeBreakdown.map((entry) => (
                  <div key={entry.type.code} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: entry.type.color, display: 'inline-block', flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{entry.type.code} — {entry.type.name}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {entry.days}d
                      <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: '0.25rem' }}>
                        ({Math.round((entry.days / totalDaysUsed) * 100)}%)
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Balance Progress Table */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>Quota Utilization by Leave Type</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>How much of each leave quota has been used vs remaining</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {balances.map((b) => {
            const usedPct = b.totalQuota > 0 ? Math.min(100, Math.round(((b.approvedDays + b.pendingDays) / b.totalQuota) * 100)) : 0;
            const approvedPct = b.totalQuota > 0 ? Math.min(100, Math.round((b.approvedDays / b.totalQuota) * 100)) : 0;
            const pendingPct = b.totalQuota > 0 ? Math.min(100, Math.round((b.pendingDays / b.totalQuota) * 100)) : 0;

            return (
              <div key={b.leaveType.code}>
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: b.leaveType.color, display: 'inline-block' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {b.leaveType.code} — {b.leaveType.name}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{b.approvedDays + b.pendingDays}</strong> / {b.totalQuota} days used
                    <span style={{ marginLeft: '0.5rem', color: b.remainingDays === 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)', fontWeight: 700 }}>
                      ({b.remainingDays} left)
                    </span>
                  </span>
                </div>

                {/* Stacked progress bar */}
                <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden', position: 'relative' }}>
                  {/* Approved segment */}
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: `${approvedPct}%`,
                    backgroundColor: b.leaveType.color,
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.5s ease-out'
                  }} />
                  {/* Pending segment */}
                  {pendingPct > 0 && (
                    <div style={{
                      position: 'absolute',
                      left: `${approvedPct}%`,
                      top: 0,
                      height: '100%',
                      width: `${pendingPct}%`,
                      backgroundColor: 'var(--accent-amber)',
                      opacity: 0.75,
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.5s ease-out'
                    }} />
                  )}
                </div>

                {/* Sub-labels */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.3rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckCircle2 size={10} color="var(--accent-emerald)" />
                    Approved: {b.approvedDays}d ({approvedPct}%)
                  </span>
                  {b.pendingDays > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={10} color="var(--accent-amber)" />
                      Pending: {b.pendingDays}d ({pendingPct}%)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
