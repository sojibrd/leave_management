'use client';

import React, { useState } from 'react';
import { LeaveRequest, LeaveStatus } from '../types/leave';
import { formatFriendlyDateRange } from '../lib/calculator';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Mail,
  Printer,
  Trash2,
  Paperclip,
  ChevronDown
} from 'lucide-react';

interface LeaveHistoryTableProps {
  leaves: LeaveRequest[];
  onUpdateStatus: (id: number, status: LeaveStatus) => Promise<void>;
  onDeleteLeave: (id: number) => Promise<void>;
  onViewEmailDraft: (leave: LeaveRequest) => void;
  onPrintForm: (leave: LeaveRequest) => void;
}

export const LeaveHistoryTable: React.FC<LeaveHistoryTableProps> = ({
  leaves,
  onUpdateStatus,
  onDeleteLeave,
  onViewEmailDraft,
  onPrintForm
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LeaveStatus>('all');
  const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);

  // Filter leaves
  const filteredLeaves = leaves.filter((l) => {
    if (statusFilter !== 'all' && l.status !== statusFilter) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchReason = l.reason.toLowerCase().includes(q);
      const matchType = l.leaveTypeName.toLowerCase().includes(q);
      const matchBackup = l.backupPerson?.toLowerCase().includes(q);
      if (!matchReason && !matchType && !matchBackup) return false;
    }
    return true;
  });

  return (
    <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
      {/* Table Controls & Title */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
            Leave Applications & History
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Track application status, change approval state, and access email notices
          </p>
        </div>

        {/* Filter Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', width: '220px' }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '32px', fontSize: '0.8125rem', padding: '0.45rem 0.5rem 0.45rem 32px' }}
              placeholder="Search leaves..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-surface-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.2rem',
            border: '1px solid var(--border-subtle)'
          }}>
            {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  border: 'none',
                  background: statusFilter === st ? 'var(--bg-surface)' : 'transparent',
                  color: statusFilter === st ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: statusFilter === st ? 700 : 500,
                  fontSize: '0.75rem',
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.15s'
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Container */}
      {filteredLeaves.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1rem',
          color: 'var(--text-muted)'
        }}>
          <Filter size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
          <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            No leave records found
          </div>
          <div style={{ fontSize: '0.8125rem' }}>
            {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters.' : 'Click "Apply for Leave" to create your first application.'}
          </div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: '0 6px',
            fontSize: '0.8125rem'
          }}>
            <thead>
              <tr style={{ color: 'var(--text-muted)', textAlign: 'left', fontSize: '0.75rem' }}>
                <th style={{ padding: '0.5rem 0.75rem' }}>LEAVE TYPE</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>DURATION & DATES</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>DAYS</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>REASON & BACKUP</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>STATUS</th>
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.map((l) => (
                <tr
                  key={l.id}
                  style={{
                    backgroundColor: 'var(--bg-surface-elevated)',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'background-color 0.15s'
                  }}
                >
                  {/* Leave Type */}
                  <td style={{
                    padding: '0.75rem',
                    borderTopLeftRadius: 'var(--radius-md)',
                    borderBottomLeftRadius: 'var(--radius-md)',
                    fontWeight: 700
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        padding: '0.2rem 0.4rem',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-surface-subtle)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--primary)'
                      }}>
                        {l.leaveTypeCode}
                      </span>
                      <span>{l.leaveTypeName}</span>
                    </div>
                  </td>

                  {/* Dates */}
                  <td style={{ padding: '0.75rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                    <div>{formatFriendlyDateRange(l.startDate, l.endDate)}</div>
                    {l.isHalfDay && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--accent-amber)', fontWeight: 600 }}>
                        Half Day ({l.halfDayPeriod === 'first-half' ? '1st Half' : '2nd Half'})
                      </div>
                    )}
                  </td>

                  {/* Total Days */}
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{
                      fontWeight: 800,
                      fontSize: '0.9375rem',
                      color: 'var(--text-primary)'
                    }}>
                      {l.totalDays}d
                    </span>
                  </td>

                  {/* Reason & Backup */}
                  <td style={{ padding: '0.75rem', maxWidth: '260px' }}>
                    <div style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: 'var(--text-secondary)'
                    }}>
                      {l.reason}
                    </div>
                    {l.backupPerson && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Handover: {l.backupPerson}
                      </div>
                    )}
                  </td>

                  {/* Status Dropdown / Action */}
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <button
                        type="button"
                        onClick={() => setActiveDropdownId(activeDropdownId === l.id ? null : l.id!)}
                        className={`badge badge-${l.status}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                        title="Click to change status"
                      >
                        {l.status === 'approved' && <CheckCircle2 size={12} />}
                        {l.status === 'pending' && <Clock size={12} />}
                        {l.status === 'rejected' && <XCircle size={12} />}
                        <span>{l.status}</span>
                        <ChevronDown size={11} style={{ marginLeft: '2px' }} />
                      </button>

                      {/* Dropdown Menu to switch status */}
                      {activeDropdownId === l.id && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          marginTop: '4px',
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-strong)',
                          borderRadius: 'var(--radius-md)',
                          boxShadow: 'var(--shadow-lg)',
                          zIndex: 50,
                          minWidth: '130px',
                          padding: '0.35rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px'
                        }}>
                          {(['pending', 'approved', 'rejected'] as LeaveStatus[]).map((st) => (
                            <button
                              key={st}
                              onClick={async () => {
                                await onUpdateStatus(l.id!, st);
                                setActiveDropdownId(null);
                              }}
                              style={{
                                border: 'none',
                                background: l.status === st ? 'var(--bg-surface-subtle)' : 'transparent',
                                color: 'var(--text-primary)',
                                textAlign: 'left',
                                padding: '0.4rem 0.6rem',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.75rem',
                                fontWeight: l.status === st ? 700 : 500,
                                cursor: 'pointer',
                                textTransform: 'capitalize'
                              }}
                            >
                              Mark as {st}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td style={{
                    padding: '0.75rem',
                    textAlign: 'right',
                    borderTopRightRadius: 'var(--radius-md)',
                    borderBottomRightRadius: 'var(--radius-md)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                      {/* View Email Draft Notice */}
                      <button
                        onClick={() => onViewEmailDraft(l)}
                        className="btn btn-secondary btn-icon-only"
                        title="View & copy official email notice"
                        style={{ padding: '0.35rem' }}
                      >
                        <Mail size={14} />
                      </button>

                      {/* Printable Form / PDF */}
                      <button
                        onClick={() => onPrintForm(l)}
                        className="btn btn-secondary btn-icon-only"
                        title="Print / Save PDF Leave Application"
                        style={{ padding: '0.35rem' }}
                      >
                        <Printer size={14} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => {
                          if (confirm(`Delete this leave record (${l.leaveTypeName}: ${l.startDate})?`)) {
                            onDeleteLeave(l.id!);
                          }
                        }}
                        className="btn btn-danger btn-icon-only"
                        title="Delete leave record"
                        style={{ padding: '0.35rem' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
