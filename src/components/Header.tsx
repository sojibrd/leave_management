'use client';

import React from 'react';
import { UserSettings } from '../types/leave';
import { Calendar, Download, Upload, Moon, Sun, Settings, UserCheck, Compass } from 'lucide-react';

interface HeaderProps {
  settings: UserSettings;
  theme: 'light' | 'dark' | 'control-room';
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onYearChange: (year: number) => void;
  selectedYear: number;
  onOpenGuide?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  theme,
  onToggleTheme,
  onOpenSettings,
  onExportData,
  onImportData,
  onYearChange,
  selectedYear,
  onOpenGuide
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const years = [
    selectedYear - 1,
    selectedYear,
    selectedYear + 1
  ];

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1.25rem 0',
      marginBottom: '1.5rem',
      borderBottom: '1px solid var(--border-subtle)',
      flexWrap: 'wrap',
      gap: '1rem'
    }}>
      {/* Brand & Employee Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 0 15px rgba(14, 165, 233, 0.3)',
          border: '1px solid rgba(56, 189, 248, 0.25)'
        }}>
          <Calendar size={24} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Leave<span className="gradient-text">Master</span>
            </h1>
            <span className="badge" style={{ fontSize: '0.7rem', backgroundColor: 'rgba(14, 165, 233, 0.12)', color: 'var(--accent-cyan)', border: '1px solid rgba(14, 165, 233, 0.28)' }}>
              Control Room
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            <UserCheck size={14} color="var(--accent-emerald)" />
            <span style={{ fontWeight: 600 }}>{settings.employeeName}</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ color: 'var(--text-muted)' }}>{settings.employeeId}</span>
          </div>
        </div>
      </div>

      {/* Actions & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
        {/* Year Selector */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--bg-surface-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '0.2rem',
          border: '1px solid var(--border-subtle)'
        }}>
          {years.map((y) => (
            <button
              key={y}
              id={`year-selector-${y}`}
              onClick={() => onYearChange(y)}
              style={{
                border: 'none',
                background: y === selectedYear ? 'var(--bg-surface)' : 'transparent',
                color: y === selectedYear ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: y === selectedYear ? 700 : 500,
                fontSize: '0.8125rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                boxShadow: y === selectedYear ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              {y}
            </button>
          ))}
        </div>

        {/* Export JSON */}
        <button
          id="btn-export-json"
          onClick={onExportData}
          className="btn btn-secondary btn-sm"
          title="Backup your leaves and settings to JSON"
        >
          <Download size={15} />
          <span className="hide-on-mobile">Backup</span>
        </button>

        {/* Import JSON */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={onImportData}
        />
        <button
          id="btn-import-json"
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-secondary btn-sm"
          title="Restore leaves data from JSON backup"
        >
          <Upload size={15} />
          <span className="hide-on-mobile">Restore</span>
        </button>

        {/* Expert Guide */}
        {onOpenGuide && (
          <button
            id="btn-open-guide-header"
            onClick={onOpenGuide}
            className="btn btn-secondary btn-sm"
            title="Master Leave Strategy & Playbook"
          >
            <Compass size={15} color="var(--primary)" />
            <span className="hide-on-mobile">Guide</span>
          </button>
        )}

        {/* Settings */}
        <button
          id="btn-open-settings"
          onClick={onOpenSettings}
          className="btn btn-secondary btn-sm"
          title="Profile & Office Settings"
        >
          <Settings size={15} />
          <span className="hide-on-mobile">Settings</span>
        </button>

        {/* Theme Toggle */}
        <button
          id="btn-toggle-theme"
          onClick={onToggleTheme}
          className="btn btn-secondary btn-icon-only"
          aria-label="Toggle theme"
          title={theme === 'control-room' || theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Control Room Mode'}
        >
          {theme === 'control-room' || theme === 'dark' ? <Sun size={17} color="#00f0ff" /> : <Moon size={17} color="#0284c7" />}
        </button>
      </div>
    </header>
  );
};
