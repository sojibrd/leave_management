'use client';

import React from 'react';
import { UserSettings } from '../types/leave';
import { Calendar, Download, Upload, Moon, Sun, Settings, UserCheck } from 'lucide-react';

interface HeaderProps {
  settings: UserSettings;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onYearChange: (year: number) => void;
  selectedYear: number;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  theme,
  onToggleTheme,
  onOpenSettings,
  onExportData,
  onImportData,
  onYearChange,
  selectedYear
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
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: 'var(--shadow-md)'
        }}>
          <Calendar size={24} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Leave<span className="gradient-text">Master</span>
            </h1>
            <span className="badge badge-weekend" style={{ fontSize: '0.7rem' }}>
              Employee Portal
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
          <span>Backup</span>
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
          <span>Restore</span>
        </button>

        {/* Settings */}
        <button
          id="btn-open-settings"
          onClick={onOpenSettings}
          className="btn btn-secondary btn-sm"
          title="Profile & Office Settings"
        >
          <Settings size={15} />
          <span>Settings</span>
        </button>

        {/* Theme Toggle */}
        <button
          id="btn-toggle-theme"
          onClick={onToggleTheme}
          className="btn btn-secondary btn-icon-only"
          aria-label="Toggle theme"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={17} color="#fbbf24" /> : <Moon size={17} color="#6366f1" />}
        </button>
      </div>
    </header>
  );
};
