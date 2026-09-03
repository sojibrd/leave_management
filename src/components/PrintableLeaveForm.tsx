'use client';

import React from 'react';
import { LeaveRequest, UserSettings } from '../types/leave';
import { formatFriendlyDate, formatFriendlyDateRange } from '../lib/calculator';
import { X, Printer } from 'lucide-react';

interface PrintableLeaveFormProps {
  isOpen: boolean;
  onClose: () => void;
  leave: LeaveRequest | null;
  settings: UserSettings;
}

export const PrintableLeaveForm: React.FC<PrintableLeaveFormProps> = ({
  isOpen,
  onClose,
  leave,
  settings
}) => {
  if (!isOpen || !leave) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content printable-document printable-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '750px',
          background: '#ffffff',
          color: '#1e293b',
          borderRadius: 'var(--radius-md)'
        }}
      >
        {/* Top Control Bar (Hidden when printed) */}
        <div className="no-print" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>
            Official Paper-Ready Preview
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button onClick={handlePrint} className="btn btn-primary btn-sm">
              <Printer size={15} />
              <span>Print Application (Ctrl+P)</span>
            </button>
            <button onClick={onClose} className="btn btn-secondary btn-sm">
              <X size={15} />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Official Document Body */}
        <div>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '2px solid #0f172a', paddingBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', letterSpacing: '0.05em' }}>
              {settings.companyName || 'Corporate Office'}
            </h2>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#334155', marginTop: '0.25rem' }}>
              APPLICATION FOR LEAVE OF ABSENCE
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.25rem' }}>
              Date of Application: {formatFriendlyDate(leave.appliedAt.slice(0, 10))}
            </p>
          </div>

          {/* Employee Details Grid */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', marginBottom: '0.5rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem' }}>
              1. Employee Particulars
            </h4>
            <div className="form-grid-2" style={{ gap: '0.75rem', fontSize: '0.875rem' }}>
              <div>
                <strong style={{ color: '#475569' }}>Name:</strong> {settings.employeeName}
              </div>
              {/* <div>
                <strong style={{ color: '#475569' }}>Employee ID:</strong> {settings.employeeId}
              </div> */}
              <div>
                <strong style={{ color: '#475569' }}>Designation:</strong> {settings.designation}
              </div>
              <div>
                <strong style={{ color: '#475569' }}>Department:</strong> {settings.department}
              </div>
            </div>
          </div>

          {/* Leave Particulars */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', marginBottom: '0.5rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem' }}>
              2. Leave Particulars
            </h4>
            <div className="form-grid-2" style={{ gap: '0.75rem', fontSize: '0.875rem' }}>
              <div>
                <strong style={{ color: '#475569' }}>Leave Type:</strong> {leave.leaveTypeName} ({leave.leaveTypeCode})
              </div>
              <div>
                <strong style={{ color: '#475569' }}>Total Working Days:</strong> {leave.totalDays} Day(s) {leave.isHalfDay ? `(Half Day - ${leave.halfDayPeriod})` : ''}
              </div>
              <div style={{ gridColumn: 'span 1' }}>
                <strong style={{ color: '#475569' }}>Period of Leave:</strong> {formatFriendlyDateRange(leave.startDate, leave.endDate)}
              </div>
              <div style={{ gridColumn: 'span 1' }}>
                <strong style={{ color: '#475569' }}>Reason for Leave:</strong> {leave.reason}
              </div>
            </div>
          </div>

          {/* Handover / Emergency */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', marginBottom: '0.5rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem' }}>
              3. Handover & Backup Arrangement
            </h4>
            <div className="form-grid-2" style={{ gap: '0.75rem', fontSize: '0.875rem' }}>
              <div>
                <strong style={{ color: '#475569' }}>Backup Person:</strong> {leave.backupPerson || 'N/A'}
              </div>
              <div>
                <strong style={{ color: '#475569' }}>Backup Contact:</strong> {leave.backupContact || 'N/A'}
              </div>
            </div>
          </div>

          {/* Signature Blocks */}
          <div className="printable-signatures" style={{
            marginTop: '3.5rem',
            textAlign: 'center',
            fontSize: '0.8125rem'
          }}>
            <div>
              <div style={{ borderTop: '1px solid #475569', paddingTop: '0.5rem', fontWeight: 700 }}>
                {settings.employeeName}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Applicant Signature</div>
            </div>

            <div>
              <div style={{ borderTop: '1px solid #475569', paddingTop: '0.5rem', fontWeight: 700 }}>
                {settings.managerName || 'Department Head'}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Recommended By</div>
            </div>

            <div>
              <div style={{ borderTop: '1px solid #475569', paddingTop: '0.5rem', fontWeight: 700 }}>
                HR / Approving Authority
              </div>
              <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Sanctioned / Approved By</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
