'use client';

import React, { useState, useEffect } from 'react';
import { Holiday, LeaveType, UserSettings } from '../types/leave';
import { X, Save, User, Briefcase, Calendar, ShieldAlert, Plus, Trash2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  leaveTypes: LeaveType[];
  onSaveSettings: (settings: UserSettings) => Promise<void>;
  onUpdateLeaveTypeQuota: (typeId: number, newQuota: number) => Promise<void>;
  onResetDemoData: () => Promise<void>;
}

const WEEKDAYS = [
  { id: 0, label: 'Sunday' },
  { id: 1, label: 'Monday' },
  { id: 2, label: 'Tuesday' },
  { id: 3, label: 'Wednesday' },
  { id: 4, label: 'Thursday' },
  { id: 5, label: 'Friday' },
  { id: 6, label: 'Saturday' }
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  leaveTypes,
  onSaveSettings,
  onUpdateLeaveTypeQuota,
  onResetDemoData
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'policy' | 'holidays' | 'data'>('profile');
  const [formData, setFormData] = useState<UserSettings>({ ...settings });
  const [quotas, setQuotas] = useState<Record<number, number>>(
    leaveTypes.reduce((acc, lt) => ({ ...acc, [lt.id!]: lt.totalQuota }), {})
  );

  // Sync formData and quotas whenever settings/leaveTypes props change (e.g. after quota update)
  useEffect(() => {
    setFormData({ ...settings });
  }, [settings]);

  useEffect(() => {
    setQuotas(leaveTypes.reduce((acc, lt) => ({ ...acc, [lt.id!]: lt.totalQuota }), {}));
  }, [leaveTypes]);

  // New holiday input state
  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayName, setNewHolidayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleWeekendToggle = (dayId: number) => {
    setFormData((prev) => {
      const current = prev.weekendDays;
      const next = current.includes(dayId)
        ? current.filter((d) => d !== dayId)
        : [...current, dayId];
      return { ...prev, weekendDays: next };
    });
  };

  const handleWeekendPreset = (preset: 'fri-sat' | 'sat-sun' | 'sun-only') => {
    if (preset === 'fri-sat') {
      setFormData((prev) => ({ ...prev, weekendDays: [5, 6] }));
    } else if (preset === 'sat-sun') {
      setFormData((prev) => ({ ...prev, weekendDays: [0, 6] }));
    } else if (preset === 'sun-only') {
      setFormData((prev) => ({ ...prev, weekendDays: [0] }));
    }
  };

  const handleAddHoliday = () => {
    if (!newHolidayDate || !newHolidayName.trim()) return;
    const newH: Holiday = {
      id: `h-${Date.now()}`,
      date: newHolidayDate,
      name: newHolidayName.trim()
    };
    setFormData((prev) => ({
      ...prev,
      customHolidays: [...prev.customHolidays, newH]
    }));
    setNewHolidayDate('');
    setNewHolidayName('');
  };

  const handleRemoveHoliday = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      customHolidays: prev.customHolidays.filter((h) => h.id !== id)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Save settings
      await onSaveSettings(formData);

      // Save updated quotas
      for (const lt of leaveTypes) {
        if (quotas[lt.id!] !== undefined && quotas[lt.id!] !== lt.totalQuota) {
          await onUpdateLeaveTypeQuota(lt.id!, Number(quotas[lt.id!]));
        }
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Settings & Preferences</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Configure your profile, office policies, weekends, and holidays
            </p>
          </div>
          <button onClick={onClose} className="btn btn-outline btn-icon-only" style={{ borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0.5rem 1.5rem',
          backgroundColor: 'var(--bg-surface-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
          gap: '0.5rem',
          overflowX: 'auto'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`btn btn-sm ${activeTab === 'profile' ? 'btn-primary' : 'btn-outline'}`}
          >
            <User size={13} />
            <span>Profile & Emails</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('policy')}
            className={`btn btn-sm ${activeTab === 'policy' ? 'btn-primary' : 'btn-outline'}`}
          >
            <Briefcase size={13} />
            <span>Weekends & Quotas</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('holidays')}
            className={`btn btn-sm ${activeTab === 'holidays' ? 'btn-primary' : 'btn-outline'}`}
          >
            <Calendar size={13} />
            <span>Holidays</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('data')}
            className={`btn btn-sm ${activeTab === 'data' ? 'btn-primary' : 'btn-outline'}`}
          >
            <ShieldAlert size={13} />
            <span>Database</span>
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {/* TAB 1: Profile & Emails */}
          {activeTab === 'profile' && (
            <div>
              <div className="form-grid-2" style={{ marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Your Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.employeeName}
                    onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Employee ID</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2" style={{ marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Designation</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Company / Office Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              </div>

              <div style={{
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px dashed var(--border-subtle)'
              }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                  Email Recipients for Auto-Drafts
                </h4>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Manager Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.managerName}
                      onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Manager Email (To:)</label>
                    <input
                      type="email"
                      className="form-input"
                      value={formData.managerEmail}
                      onChange={(e) => setFormData({ ...formData, managerEmail: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">HR Email (Cc:)</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.hrEmail}
                    onChange={(e) => setFormData({ ...formData, hrEmail: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Weekends & Quotas */}
          {activeTab === 'policy' && (
            <div>
              {/* Office Weekend selector */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Weekly Days Off (Weekends)</label>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  These days are automatically excluded from your leave day count deductions.
                </p>

                {/* Presets */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleWeekendPreset('fri-sat')}
                    className="btn btn-secondary btn-sm"
                  >
                    Friday & Saturday (BD/ME)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWeekendPreset('sat-sun')}
                    className="btn btn-secondary btn-sm"
                  >
                    Saturday & Sunday (Global)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWeekendPreset('sun-only')}
                    className="btn btn-secondary btn-sm"
                  >
                    Sunday Only
                  </button>
                </div>

                {/* Weekday checkboxes */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                  gap: '0.5rem'
                }}>
                  {WEEKDAYS.map((w) => {
                    const checked = formData.weekendDays.includes(w.id);
                    return (
                      <label
                        key={w.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.45rem 0.6rem',
                          backgroundColor: checked ? 'var(--primary-subtle)' : 'var(--bg-surface-subtle)',
                          border: `1px solid ${checked ? 'var(--border-focus)' : 'var(--border-subtle)'}`,
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8125rem',
                          fontWeight: checked ? 700 : 500,
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleWeekendToggle(w.id)}
                          style={{ accentColor: 'var(--primary)' }}
                        />
                        <span>{w.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Annual Quotas */}
              <div style={{
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px dashed var(--border-subtle)'
              }}>
                <label className="form-label">Annual Leave Quota Allocation (Days per year)</label>
                <div className="form-grid-2">
                  {leaveTypes.map((lt) => (
                    <div key={lt.id} className="form-group" style={{ marginBottom: '0.75rem' }}>
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: lt.color }} />
                        <span>{lt.name} ({lt.code})</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="365"
                        className="form-input"
                        value={quotas[lt.id!] !== undefined ? quotas[lt.id!] : lt.totalQuota}
                        onChange={(e) => setQuotas({ ...quotas, [lt.id!]: Number(e.target.value) })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Holidays */}
          {activeTab === 'holidays' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>
                  Official Public Holidays ({formData.customHolidays.length})
                </label>
              </div>

              {/* Add holiday row */}
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1rem',
                flexWrap: 'wrap'
              }}>
                <input
                  type="date"
                  className="form-input"
                  style={{ flex: '1 1 130px', minWidth: '120px' }}
                  value={newHolidayDate}
                  onChange={(e) => setNewHolidayDate(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Holiday Name (e.g. Eid-ul-Fitr)"
                  className="form-input"
                  style={{ flex: '2 1 160px', minWidth: '140px' }}
                  value={newHolidayName}
                  onChange={(e) => setNewHolidayName(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleAddHoliday}
                  className="btn btn-secondary btn-sm"
                  style={{ flexShrink: 0 }}
                  disabled={!newHolidayDate || !newHolidayName.trim()}
                >
                  <Plus size={14} />
                  <span>Add</span>
                </button>
              </div>

              {/* Holidays list */}
              <div style={{
                maxHeight: '220px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem'
              }}>
                {formData.customHolidays.map((h) => (
                  <div
                    key={h.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: 'var(--bg-surface-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8125rem'
                    }}
                  >
                    <div>
                      <strong style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>{h.date}</strong>
                      <span>{h.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveHoliday(h.id)}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--accent-rose)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Database & Reset */}
          {activeTab === 'data' && (
            <div>
              <div style={{
                backgroundColor: 'rgba(244, 63, 94, 0.08)',
                border: '1px solid rgba(244, 63, 94, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.25rem'
              }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-rose)', marginBottom: '0.35rem' }}>
                  Reset & Danger Zone
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  If you wish to restore default sample data and clear all custom entries, you can reset the local database.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm('Are you sure you want to reset the database? All existing records will be cleared and reset to sample defaults.')) {
                      await onResetDemoData();
                      onClose();
                    }
                  }}
                  className="btn btn-danger btn-sm"
                >
                  <Trash2 size={14} />
                  <span>Reset Database to Defaults</span>
                </button>
              </div>

              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                💡 <em>Tip: You can use the "Backup" button on the top navigation bar at any time to export your entire database as a portable JSON file.</em>
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-subtle)',
            marginTop: '1.5rem'
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving}
            >
              <Save size={16} />
              <span>{saveSuccess ? 'Saved!' : isSaving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
