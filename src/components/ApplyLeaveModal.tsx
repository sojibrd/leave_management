'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { LeaveAttachment, LeaveBalanceSummary, LeaveRequest, LeaveType, UserSettings } from '../types/leave';
import { calculateWorkingDays, checkLeaveOverlap, formatFriendlyDate, splitCrossYearLeave, toDateString } from '../lib/calculator';
import { X, Calendar, AlertCircle, AlertTriangle, Info, FileText, Check, Paperclip, Trash2, Lightbulb } from 'lucide-react';
import { getSuggestionsForType } from '../lib/leaveExamples';

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaveTypes: LeaveType[];
  preselectedType?: LeaveType | null;
  settings: UserSettings;
  onSubmit: (leave: Omit<LeaveRequest, 'id'>) => Promise<LeaveRequest>;
  leaves?: LeaveRequest[];
  balances?: LeaveBalanceSummary[];
  initialStartDate?: string;
  initialEndDate?: string;
  initialReason?: string;
}

export const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({
  isOpen,
  onClose,
  leaveTypes,
  preselectedType,
  settings,
  onSubmit,
  leaves = [],
  balances = [],
  initialStartDate,
  initialEndDate,
  initialReason
}) => {
  const todayStr = useMemo(() => toDateString(new Date()), []);

  const [selectedTypeId, setSelectedTypeId] = useState<number>(0);
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>(todayStr);
  const [isHalfDay, setIsHalfDay] = useState<boolean>(false);
  const [halfDayPeriod, setHalfDayPeriod] = useState<'first-half' | 'second-half'>('first-half');
  const [reason, setReason] = useState<string>('');
  const [backupPerson, setBackupPerson] = useState<string>('');
  const [backupContact, setBackupContact] = useState<string>('');
  const [attachments, setAttachments] = useState<LeaveAttachment[]>([]);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  // Deduplicate leave types by code to prevent double-render
  const uniqueLeaveTypes = useMemo(() => {
    const map = new Map<string, LeaveType>();
    for (const lt of leaveTypes) {
      if (!map.has(lt.code)) {
        map.set(lt.code, lt);
      }
    }
    return Array.from(map.values());
  }, [leaveTypes]);

  // Suggestions for the selected leave type
  const currentTypeCode = useMemo(() => {
    const t = uniqueLeaveTypes.find((lt) => lt.id === selectedTypeId);
    return t?.code ?? '';
  }, [uniqueLeaveTypes, selectedTypeId]);

  const suggestions = useMemo(
    () => getSuggestionsForType(currentTypeCode),
    [currentTypeCode]
  );

  // Set default selected type
  useEffect(() => {
    if (preselectedType?.id) {
      setSelectedTypeId(preselectedType.id);
    } else if (uniqueLeaveTypes.length > 0 && !selectedTypeId) {
      setSelectedTypeId(uniqueLeaveTypes[0].id || 0);
    }
  }, [preselectedType, uniqueLeaveTypes, selectedTypeId]);

  // Reset or initialize form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (initialStartDate) setStartDate(initialStartDate);
      if (initialEndDate) setEndDate(initialEndDate);
      if (initialReason) setReason(initialReason);
    } else {
      setStartDate(todayStr);
      setEndDate(todayStr);
      setIsHalfDay(false);
      setHalfDayPeriod('first-half');
      setReason('');
      setBackupPerson('');
      setBackupContact('');
      setAttachments([]);
      setError('');
      setIsSubmitting(false);
      setSelectedTypeId(0);
    }
  }, [isOpen, todayStr, initialStartDate, initialEndDate, initialReason]);

  // If start date is after end date, automatically sync end date to start date
  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    if (val > endDate) {
      setEndDate(val);
    }
  };

  // When half day is toggled, sync end date to start date
  const handleHalfDayToggle = (checked: boolean) => {
    setIsHalfDay(checked);
    if (checked) {
      setEndDate(startDate);
    }
  };

  // Live calculation of working days
  const calculation = useMemo(() => {
    return calculateWorkingDays(
      startDate,
      isHalfDay ? startDate : endDate,
      settings.weekendDays,
      settings.customHolidays,
      isHalfDay
    );
  }, [startDate, endDate, isHalfDay, settings.weekendDays, settings.customHolidays]);

  // Overlap conflict detection
  const overlapResult = useMemo(() => {
    if (!startDate || (!isHalfDay && !endDate)) {
      return { hasConflict: false };
    }
    return checkLeaveOverlap(
      startDate,
      isHalfDay ? startDate : endDate,
      isHalfDay,
      halfDayPeriod,
      leaves
    );
  }, [startDate, endDate, isHalfDay, halfDayPeriod, leaves]);

  // Selected leave type balance & quota exhaustion check
  const selectedBalance = useMemo(() => {
    if (!selectedTypeId || !balances || balances.length === 0) return null;
    return balances.find((b) => b.leaveType.id === selectedTypeId) || null;
  }, [selectedTypeId, balances]);

  const exceedsQuota = useMemo(() => {
    if (!selectedBalance || calculation.workingDays <= 0) return false;
    return calculation.workingDays > selectedBalance.remainingDays;
  }, [selectedBalance, calculation.workingDays]);

  // Cross-year partition check
  const crossYearPartitions = useMemo(() => {
    if (!startDate || (!isHalfDay && !endDate)) return [];
    return splitCrossYearLeave(startDate, isHalfDay ? startDate : endDate);
  }, [startDate, endDate, isHalfDay]);

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      setError('Attachment file size must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const newAttachment: LeaveAttachment = {
        id: `att-${Date.now()}`,
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl
      };
      setAttachments((prev) => [...prev, newAttachment]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedTypeId) {
      setError('Please select a leave category.');
      return;
    }
    if (!startDate) {
      setError('Please select a start date.');
      return;
    }
    if (!isHalfDay && !endDate) {
      setError('Please select an end date.');
      return;
    }
    if (startDate > (isHalfDay ? startDate : endDate)) {
      setError('Start date cannot be after end date.');
      return;
    }
    if (calculation.workingDays <= 0) {
      setError('Selected dates fall entirely on weekends or official holidays (0 working days). Please choose valid working days.');
      return;
    }
    if (overlapResult.hasConflict) {
      setError(overlapResult.conflictReason || 'The selected dates conflict with an existing leave.');
      return;
    }
    if (!reason.trim()) {
      setError('Please provide a reason for the leave application.');
      return;
    }

    const currentType = leaveTypes.find((t) => t.id === selectedTypeId);
    if (!currentType) {
      setError('Invalid leave category.');
      return;
    }

    setIsSubmitting(true);
    try {
      const nowIso = new Date().toISOString();
      const leaveData: Omit<LeaveRequest, 'id'> = {
        leaveTypeId: currentType.id!,
        leaveTypeName: currentType.name,
        leaveTypeCode: currentType.code,
        startDate,
        endDate: isHalfDay ? startDate : endDate,
        isHalfDay,
        halfDayPeriod: isHalfDay ? halfDayPeriod : undefined,
        totalDays: Number(calculation.workingDays),
        reason: reason.trim(),
        backupPerson: backupPerson.trim() || undefined,
        backupContact: backupContact.trim() || undefined,
        status: 'pending',
        appliedAt: nowIso,
        updatedAt: nowIso,
        attachments: attachments.length > 0 ? attachments : undefined
      };

      await onSubmit(leaveData);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit leave application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentType = leaveTypes.find((t) => t.id === selectedTypeId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)'
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
              <Calendar size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Apply for Leave</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Fill out the application details to log leave and draft your official notice
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-outline btn-icon-only"
            style={{ borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(244, 63, 94, 0.12)',
              color: 'var(--accent-rose)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              fontSize: '0.8125rem',
              marginBottom: '1.25rem'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Leave Type Selector */}
          <div className="form-group">
            <label className="form-label">Leave Category</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '0.5rem'
            }}>
              {uniqueLeaveTypes.map((type) => {
                const isSelected = type.id === selectedTypeId;
                return (
                  <button
                    key={type.code}
                    type="button"
                    onClick={() => setSelectedTypeId(type.id!)}
                    style={{
                      border: `1.5px solid ${isSelected ? type.color : 'var(--border-subtle)'}`,
                      backgroundColor: isSelected ? type.bgColor : 'var(--bg-surface-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.625rem 0.5rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.2rem'
                    }}
                  >
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: isSelected ? type.color : 'var(--text-primary)' }}>
                      {type.name}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Code: {type.code}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Half Day Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--bg-surface-subtle)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            border: '1px solid var(--border-subtle)'
          }}>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Half Day Leave
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Deduct 0.5 days for partial work day
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={isHalfDay}
                onChange={(e) => handleHalfDayToggle(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Enable</span>
            </label>
          </div>

          {/* Date Picker Range */}
          <div className="form-grid-2" style={{ marginBottom: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">{isHalfDay ? 'Leave Date' : 'Start Date'}</label>
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                required
              />
            </div>

            {isHalfDay ? (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Half-Day Session</label>
                <select
                  className="form-select"
                  value={halfDayPeriod}
                  onChange={(e) => setHalfDayPeriod(e.target.value as any)}
                >
                  <option value="first-half">First Half (Morning session)</option>
                  <option value="second-half">Second Half (Afternoon session)</option>
                </select>
              </div>
            ) : (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            )}
          </div>

          {/* Live Working Days Calculation Badge */}
          <div style={{
            backgroundColor: calculation.workingDays > 0 ? 'var(--primary-subtle)' : 'rgba(245, 158, 11, 0.12)',
            border: `1px solid ${calculation.workingDays > 0 ? 'var(--border-focus)' : 'rgba(245, 158, 11, 0.3)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} color="var(--primary)" />
              <div>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Total Deduction: {calculation.workingDays} Working {calculation.workingDays === 1 || calculation.workingDays === 0.5 ? 'Day' : 'Days'}
                </span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {calculation.calendarDays} calendar day(s) • {calculation.weekendCount} weekend(s) excluded • {calculation.holidayCount} holiday(s) excluded
                </div>
              </div>
            </div>
            {calculation.workingDays > 0 && (
              <span className="badge badge-approved">
                Valid Selection
              </span>
            )}
          </div>

          {/* Overlap Conflict Alert */}
          {overlapResult.hasConflict && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.625rem',
              backgroundColor: 'rgba(244, 63, 94, 0.12)',
              color: 'var(--accent-rose)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              fontSize: '0.8125rem',
              marginBottom: '1.25rem',
              lineHeight: 1.4
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', marginBottom: '2px' }}>Date Conflict Detected</strong>
                <span>{overlapResult.conflictReason}</span>
              </div>
            </div>
          )}

          {/* Quota Exhaustion / LOP Notice */}
          {exceedsQuota && !overlapResult.hasConflict && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.625rem',
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              color: '#d97706',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              fontSize: '0.8125rem',
              marginBottom: '1.25rem',
              lineHeight: 1.4
            }}>
              <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', marginBottom: '2px' }}>Quota Notice</strong>
                <span>
                  You are requesting <strong>{calculation.workingDays} working days</strong>, but you only have{' '}
                  <strong>{selectedBalance?.remainingDays ?? 0} days</strong> remaining in {selectedBalance?.leaveType.name}.
                  Submitting this will exceed your allocated balance and may be treated as Unpaid Leave (LOP).
                </span>
              </div>
            </div>
          )}

          {/* Cross-Year Crossover Info */}
          {crossYearPartitions.length > 1 && !overlapResult.hasConflict && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.625rem',
              backgroundColor: 'rgba(59, 130, 246, 0.12)',
              color: '#2563eb',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              fontSize: '0.8125rem',
              marginBottom: '1.25rem',
              lineHeight: 1.4
            }}>
              <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', marginBottom: '2px' }}>Cross-Year Application</strong>
                <span>
                  This leave spans across calendar years ({crossYearPartitions.map((p) => p.year).join(' & ')}). Days will be distributed to each respective year's quota.
                </span>
              </div>
            </div>
          )}

          {/* Reason Input */}
          <div className="form-group">
            <label className="form-label">
              Reason for Leave <span style={{ color: 'var(--accent-rose)' }}>*</span>
            </label>
            <textarea
              className="form-textarea"
              placeholder="E.g. Traveling to hometown for family wedding / High fever and bed rest recommended by physician"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />

            {/* Suggestions Toggle */}
            {suggestions.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowSuggestions((v) => !v)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.775rem',
                    fontWeight: 600,
                    color: showSuggestions ? 'var(--primary)' : 'var(--text-muted)',
                    padding: '0.2rem 0',
                    transition: 'color 0.15s'
                  }}
                >
                  <Lightbulb size={13} />
                  {showSuggestions ? 'Hide examples' : `See ${suggestions.length} real examples for ${currentTypeCode}`}
                </button>

                {/* Chips Grid */}
                {showSuggestions && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.4rem',
                    marginTop: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setReason(s);
                          setShowSuggestions(false);
                        }}
                        title={s}
                        style={{
                          background: reason === s ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                          border: `1px solid ${reason === s ? 'var(--primary)' : 'var(--border-subtle)'}`,
                          borderRadius: 'var(--radius-full)',
                          padding: '0.3rem 0.65rem',
                          fontSize: '0.72rem',
                          fontWeight: 500,
                          color: reason === s ? 'var(--primary)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          lineHeight: 1.35,
                          maxWidth: '100%',
                          transition: 'all 0.15s',
                          whiteSpace: 'normal'
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Handover / Backup Colleague */}
          <div className="form-grid-2" style={{ marginBottom: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Backup / Handover Person</label>
              <input
                type="text"
                className="form-input"
                placeholder="E.g. Jane Doe (Senior Dev)"
                value={backupPerson}
                onChange={(e) => setBackupPerson(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Backup Contact (Email/Phone)</label>
              <input
                type="text"
                className="form-input"
                placeholder="E.g. jane@company.com / +8801..."
                value={backupContact}
                onChange={(e) => setBackupContact(e.target.value)}
              />
            </div>
          </div>

          {/* File Attachment for Sick Leave / Medical Certificates */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Attachments (Optional - Medical Slip, Prescription, etc.)</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max 5MB</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                <Paperclip size={14} />
                <span>Upload Document</span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>

              {attachments.map((att) => (
                <span
                  key={att.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <FileText size={12} color="var(--primary)" />
                  <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {att.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(att.id)}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--accent-rose)' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            flexWrap: 'wrap',
            gap: '0.75rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              id="btn-submit-leave-form"
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || calculation.workingDays <= 0 || overlapResult.hasConflict}
            >
              {isSubmitting ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <Check size={16} />
                  <span>Submit & Generate Email</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
