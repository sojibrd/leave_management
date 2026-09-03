'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { LeaveRequest, LeaveType, LeaveStatus, UserSettings } from '../types/leave';
import {
  db,
  initializeDatabase,
  getSettings,
  saveSettings,
  exportDatabaseToJson,
  importDatabaseFromJson,
  DEFAULT_SETTINGS,
  DEFAULT_LEAVE_TYPES
} from '../lib/db';
import { calculateBalances } from '../lib/calculator';
import { Header } from '../components/Header';
import { BalanceCards } from '../components/BalanceCards';
import { CalendarView } from '../components/CalendarView';
import { LeaveHistoryTable } from '../components/LeaveHistoryTable';
import { ApplyLeaveModal } from '../components/ApplyLeaveModal';
import { EmailDraftModal } from '../components/EmailDraftModal';
import { PrintableLeaveForm } from '../components/PrintableLeaveForm';
import { SettingsModal } from '../components/SettingsModal';
import { ExpertGuideView } from '../components/ExpertGuideView';
import { AnalyticsView } from '../components/AnalyticsView';
import { CheckCircle, AlertTriangle, Info, CalendarDays, History, Sliders, Compass, BarChart2 } from 'lucide-react';

export default function LeaveManagementDashboard() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'history' | 'analytics' | 'guide'>('dashboard');

  // Modals state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [preselectedType, setPreselectedType] = useState<LeaveType | null>(null);
  const [prefilledDates, setPrefilledDates] = useState<{ startDate?: string; endDate?: string; reason?: string } | null>(null);

  const [isEmailDraftOpen, setIsEmailDraftOpen] = useState(false);
  const [activeLeaveForDraft, setActiveLeaveForDraft] = useState<LeaveRequest | null>(null);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [activeLeaveForPrint, setActiveLeaveForPrint] = useState<LeaveRequest | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Sync theme
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('leave_master_theme', nextTheme);
  };

  // Seed sample records if database has 0 leaves on first open
  const seedDemoLeavesIfEmpty = async () => {
    const count = await db.leaves.count();
    if (count === 0) {
      const types = await db.leaveTypes.toArray();
      // Guard: if no types seeded yet, skip — avoids crash
      if (types.length < 2) return;
      const cl = types.find((t) => t.code === 'CL') || types[0];
      const sl = types.find((t) => t.code === 'SL') || types[1];
      if (!cl || !sl) return;

      const currentYearStr = String(new Date().getFullYear());

      // Add 2 sample records
      await db.leaves.add({
        leaveTypeId: cl.id!,
        leaveTypeName: cl.name,
        leaveTypeCode: cl.code,
        startDate: `${currentYearStr}-02-15`,
        endDate: `${currentYearStr}-02-16`,
        isHalfDay: false,
        totalDays: 2,
        reason: 'Attending sibling wedding ceremony in hometown',
        backupPerson: 'Rafiqul Islam',
        backupContact: 'rafiq@company.com',
        status: 'approved',
        appliedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString()
      });

      await db.leaves.add({
        leaveTypeId: sl.id!,
        leaveTypeName: sl.name,
        leaveTypeCode: sl.code,
        startDate: `${currentYearStr}-03-10`,
        endDate: `${currentYearStr}-03-10`,
        isHalfDay: true,
        halfDayPeriod: 'second-half',
        totalDays: 0.5,
        reason: 'Dental checkup and routine consultation',
        backupPerson: 'Tanvir Ahmed',
        status: 'approved',
        appliedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString()
      });
    }
  };

  // Load all data
  const loadData = async () => {
    try {
      await initializeDatabase();
      await seedDemoLeavesIfEmpty();

      const userSettings = await getSettings();
      const allTypes = await db.leaveTypes.toArray();
      const allLeaves = await db.leaves.toArray();

      // Sort leaves by date descending
      allLeaves.sort((a, b) => (b.startDate > a.startDate ? 1 : -1));

      // Deduplicate leave types by code
      const uniqueTypesMap = new Map<string, LeaveType>();
      for (const t of allTypes) {
        if (!uniqueTypesMap.has(t.code)) {
          uniqueTypesMap.set(t.code, t);
        }
      }
      const uniqueTypes = Array.from(uniqueTypesMap.values());

      setSettings(userSettings);
      setLeaveTypes(uniqueTypes);
      setLeaves(allLeaves);
    } catch (err) {
      console.error('Failed to load database:', err);
      showToast('Error accessing IndexedDB storage.', 'error');
    }
  };

  useEffect(() => {
    setMounted(true);
    const savedTheme = (localStorage.getItem('leave_master_theme') as 'light' | 'dark') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    loadData();
  }, []);

  // Compute live balances
  const balances = useMemo(() => {
    return calculateBalances(leaveTypes, leaves, selectedYear);
  }, [leaveTypes, leaves, selectedYear]);

  // Leave Actions
  const handleApplyForType = (type: LeaveType) => {
    setPrefilledDates(null);
    setPreselectedType(type);
    setIsApplyModalOpen(true);
  };

  const handleOpenNewLeaveModal = () => {
    setPrefilledDates(null);
    setPreselectedType(null);
    setIsApplyModalOpen(true);
  };

  const handleApplyForBridge = (startDate: string, endDate: string, reason: string) => {
    setPrefilledDates({ startDate, endDate, reason });
    setPreselectedType(null);
    setIsApplyModalOpen(true);
  };

  const handleSubmitLeave = async (leaveData: Omit<LeaveRequest, 'id'>) => {
    const id = await db.leaves.add(leaveData as LeaveRequest);
    const created: LeaveRequest = { ...leaveData, id: Number(id) };

    // Refresh state
    const allLeaves = await db.leaves.toArray();
    allLeaves.sort((a, b) => (b.startDate > a.startDate ? 1 : -1));
    setLeaves(allLeaves);

    showToast('Leave application submitted & logged successfully!', 'success');

    // Automatically prompt official email draft modal
    setActiveLeaveForDraft(created);
    setIsEmailDraftOpen(true);

    return created;
  };

  const handleUpdateStatus = async (id: number, newStatus: LeaveStatus) => {
    await db.leaves.update(id, {
      status: newStatus,
      updatedAt: new Date().toISOString()
    });

    const allLeaves = await db.leaves.toArray();
    allLeaves.sort((a, b) => (b.startDate > a.startDate ? 1 : -1));
    setLeaves(allLeaves);

    showToast(`Leave status updated to "${newStatus}".`, 'info');
  };

  const handleDeleteLeave = async (id: number) => {
    await db.leaves.delete(id);
    const allLeaves = await db.leaves.toArray();
    allLeaves.sort((a, b) => (b.startDate > a.startDate ? 1 : -1));
    setLeaves(allLeaves);
    showToast('Leave record removed.', 'info');
  };

  const handleSaveSettings = async (newSettings: UserSettings) => {
    await saveSettings(newSettings);
    setSettings(newSettings);
    showToast('Settings saved successfully.', 'success');
  };

  const handleUpdateLeaveTypeQuota = async (typeId: number, newQuota: number) => {
    try {
      await db.leaveTypes.update(typeId, { totalQuota: newQuota });
      const allTypes = await db.leaveTypes.toArray();
      // Deduplicate by code (consistent with loadData)
      const uniqueTypesMap = new Map<string, LeaveType>();
      for (const t of allTypes) {
        if (!uniqueTypesMap.has(t.code)) uniqueTypesMap.set(t.code, t);
      }
      setLeaveTypes(Array.from(uniqueTypesMap.values()));
    } catch (err) {
      console.error('Failed to update quota:', err);
      showToast('Failed to update leave quota.', 'error');
    }
  };

  const handleExportJson = async () => {
    const jsonStr = await exportDatabaseToJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leave-master-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Complete backup file downloaded.', 'success');
  };

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const content = reader.result as string;
      const res = await importDatabaseFromJson(content);
      if (res.success) {
        await loadData();
        showToast('Data restored from JSON backup!', 'success');
      } else {
        showToast(res.message, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetDemoData = async () => {
    try {
      await db.transaction('rw', db.leaves, db.leaveTypes, db.settingsTable, async () => {
        await db.leaves.clear();
        await db.leaveTypes.clear();
        for (const lt of DEFAULT_LEAVE_TYPES) {
          await db.leaveTypes.add(lt as LeaveType);
        }
      });
      await saveSettings(DEFAULT_SETTINGS);
      await seedDemoLeavesIfEmpty();
      await loadData();
      showToast('Database reset to defaults.', 'info');
    } catch (err) {
      console.error('Reset failed:', err);
      showToast('Failed to reset database. Please try again.', 'error');
    }
  };

  const handleViewEmailDraft = (leave: LeaveRequest) => {
    setActiveLeaveForDraft(leave);
    setIsEmailDraftOpen(true);
  };

  const handleOpenPrintView = (leave: LeaveRequest) => {
    setActiveLeaveForPrint(leave);
    setIsPrintModalOpen(true);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          backgroundColor: toast.type === 'success'
            ? 'var(--toast-success-bg)'
            : toast.type === 'error'
            ? 'var(--toast-error-bg)'
            : 'var(--toast-info-bg)',
          color: '#ffffff',
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-xl)',
          fontSize: '0.875rem',
          fontWeight: 600,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {toast.type === 'success' && <CheckCircle size={18} color="var(--toast-success-icon)" />}
          {toast.type === 'error' && <AlertTriangle size={18} color="var(--toast-error-icon)" />}
          {toast.type === 'info' && <Info size={18} color="var(--toast-info-icon)" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Navigation & Header */}
      <Header
        settings={settings}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onExportData={handleExportJson}
        onImportData={handleImportJson}
        onYearChange={setSelectedYear}
        selectedYear={selectedYear}
        onOpenGuide={() => setActiveTab('guide')}
      />

      {/* Main Tabs Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1.75rem',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '0.75rem'
      }}>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-outline'}`}
        >
          <Sliders size={16} />
          <span>Dashboard & Balances</span>
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`btn ${activeTab === 'calendar' ? 'btn-primary' : 'btn-outline'}`}
        >
          <CalendarDays size={16} />
          <span>Leave Calendar</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-outline'}`}
        >
          <History size={16} />
          <span>Application History ({leaves.filter((l) => new Date(l.startDate).getFullYear() === selectedYear).length})</span>
        </button>
        <button
          id="tab-analytics"
          onClick={() => setActiveTab('analytics')}
          className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-outline'}`}
        >
          <BarChart2 size={16} />
          <span>Analytics</span>
        </button>
        <button
          id="tab-expert-guide"
          onClick={() => setActiveTab('guide')}
          className={`btn ${activeTab === 'guide' ? 'btn-primary' : 'btn-outline'}`}
        >
          <Compass size={16} />
          <span>Expert Guide & Strategy</span>
        </button>
      </div>

      {/* TAB 1: Dashboard View */}
      {activeTab === 'dashboard' && (
        <>
          <BalanceCards
            balances={balances}
            onApplyForType={handleApplyForType}
            onOpenNewLeaveModal={handleOpenNewLeaveModal}
            selectedYear={selectedYear}
          />
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            gap: '1.5rem'
          }}>
            <CalendarView
              leaves={leaves}
              settings={settings}
              selectedYear={selectedYear}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <LeaveHistoryTable
                leaves={leaves.slice(0, 5)}
                onUpdateStatus={handleUpdateStatus}
                onDeleteLeave={handleDeleteLeave}
                onViewEmailDraft={handleViewEmailDraft}
                onPrintForm={handleOpenPrintView}
              />
            </div>
          </div>
        </>
      )}

      {/* TAB 2: Full Calendar View */}
      {activeTab === 'calendar' && (
        <CalendarView
          leaves={leaves}
          settings={settings}
          selectedYear={selectedYear}
        />
      )}

      {/* TAB 3: Full History View */}
      {activeTab === 'history' && (
        <LeaveHistoryTable
          leaves={leaves}
          onUpdateStatus={handleUpdateStatus}
          onDeleteLeave={handleDeleteLeave}
          onViewEmailDraft={handleViewEmailDraft}
          onPrintForm={handleOpenPrintView}
        />
      )}

      {/* TAB 4: Analytics */}
      {activeTab === 'analytics' && (
        <AnalyticsView
          leaves={leaves}
          leaveTypes={leaveTypes}
          balances={balances}
          selectedYear={selectedYear}
        />
      )}

      {/* TAB 5: Expert Guide & Playbook */}
      {activeTab === 'guide' && (
        <ExpertGuideView
          onApplyForBridge={handleApplyForBridge}
          settings={settings}
          selectedYear={selectedYear}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {/* Modals */}
      <ApplyLeaveModal
        isOpen={isApplyModalOpen}
        onClose={() => {
          setIsApplyModalOpen(false);
          setPrefilledDates(null);
        }}
        leaveTypes={leaveTypes}
        preselectedType={preselectedType}
        settings={settings}
        onSubmit={handleSubmitLeave}
        leaves={leaves}
        balances={balances}
        initialStartDate={prefilledDates?.startDate}
        initialEndDate={prefilledDates?.endDate}
        initialReason={prefilledDates?.reason}
      />

      <EmailDraftModal
        isOpen={isEmailDraftOpen}
        onClose={() => setIsEmailDraftOpen(false)}
        leave={activeLeaveForDraft}
        settings={settings}
        onOpenPrintView={handleOpenPrintView}
      />

      <PrintableLeaveForm
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        leave={activeLeaveForPrint}
        settings={settings}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        leaveTypes={leaveTypes}
        onSaveSettings={handleSaveSettings}
        onUpdateLeaveTypeQuota={handleUpdateLeaveTypeQuota}
        onResetDemoData={handleResetDemoData}
      />
    </div>
  );
}
