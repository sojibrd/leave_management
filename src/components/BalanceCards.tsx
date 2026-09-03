'use client';

import React from 'react';
import { LeaveBalanceSummary, LeaveType } from '../types/leave';
import { PlusCircle, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';

interface BalanceCardsProps {
  balances: LeaveBalanceSummary[];
  onApplyForType: (leaveType: LeaveType) => void;
  onOpenNewLeaveModal: () => void;
}

export const BalanceCards: React.FC<BalanceCardsProps> = ({
  balances,
  onApplyForType,
  onOpenNewLeaveModal
}) => {
  // Calculate aggregate totals
  const totalAllocated = balances.reduce((acc, b) => acc + Number(b.totalQuota || 0), 0);
  const totalApproved = balances.reduce((acc, b) => acc + Number(b.approvedDays || 0), 0);
  const totalPending = balances.reduce((acc, b) => acc + Number(b.pendingDays || 0), 0);
  const totalRemaining = balances.reduce((acc, b) => acc + Number(b.remainingDays || 0), 0);

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* Top Banner with Quick Actions & Overall Metric */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Leave Balance Overview
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Total Allocated: <strong style={{ color: 'var(--text-primary)' }}>{totalAllocated} days</strong> • Taken: <strong style={{ color: 'var(--accent-emerald)' }}>{totalApproved}</strong> • Pending: <strong style={{ color: 'var(--accent-amber)' }}>{totalPending}</strong> • Available: <strong style={{ color: 'var(--primary)' }}>{totalRemaining}</strong>
          </p>
        </div>

        <button
          id="btn-apply-leave-main"
          onClick={onOpenNewLeaveModal}
          className="btn btn-primary"
          style={{ fontSize: '0.9375rem', padding: '0.75rem 1.35rem' }}
        >
          <PlusCircle size={18} />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Grid of Leave Type Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.25rem'
      }}>
        {balances.map((summary) => {
          const { leaveType, totalQuota, approvedDays, pendingDays, remainingDays, percentageUsed } = summary;

          return (
            <div
              key={leaveType.code}
              className="glass-card glass-card-interactive"
              style={{
                padding: '1.25rem',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              {/* Top Accent Line */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                backgroundColor: leaveType.color
              }} />

              <div>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      display: 'inline-block',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: leaveType.color
                    }} />
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {leaveType.name}
                    </h3>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: leaveType.bgColor,
                    color: leaveType.color,
                    border: `1px solid ${leaveType.borderColor}`
                  }}>
                    {leaveType.code}
                  </span>
                </div>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', minHeight: '36px' }}>
                  {leaveType.description}
                </p>

                {/* Big Remaining Days Display */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.875rem' }}>
                  <span style={{
                    fontSize: '2.25rem',
                    fontWeight: 800,
                    lineHeight: 1,
                    color: remainingDays === 0 ? 'var(--accent-rose)' : 'var(--text-primary)'
                  }}>
                    {remainingDays}
                  </span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    days left / {totalQuota} total
                  </span>
                </div>

                {/* Progress Bar */}
                <div style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: `${percentageUsed}%`,
                    height: '100%',
                    backgroundColor: leaveType.color,
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.4s ease-out'
                  }} />
                </div>

                {/* Approved & Pending stats */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.8125rem',
                  color: 'var(--text-secondary)',
                  paddingTop: '0.5rem',
                  borderTop: '1px dashed var(--border-subtle)',
                  marginBottom: '1rem'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckCircle2 size={13} color="var(--accent-emerald)" />
                    Used: <strong>{approvedDays}d</strong>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={13} color="var(--accent-amber)" />
                    Pending: <strong>{pendingDays}d</strong>
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                id={`btn-apply-${leaveType.code.toLowerCase()}`}
                onClick={() => onApplyForType(leaveType)}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%' }}
                disabled={remainingDays <= 0}
              >
                {remainingDays <= 0 ? (
                  <>
                    <ShieldAlert size={14} color="var(--accent-rose)" />
                    <span>Quota Exhausted</span>
                  </>
                ) : (
                  <>
                    <PlusCircle size={14} />
                    <span>Apply {leaveType.code}</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
