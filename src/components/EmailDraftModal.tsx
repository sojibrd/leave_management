'use client';

import React, { useState } from 'react';
import { LeaveRequest, UserSettings } from '../types/leave';
import { generateLeaveEmailDraft } from '../lib/emailGenerator';
import { X, Mail, Copy, Check, ExternalLink, Printer } from 'lucide-react';

interface EmailDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  leave: LeaveRequest | null;
  settings: UserSettings;
  onOpenPrintView: (leave: LeaveRequest) => void;
}

type CopyField = 'to' | 'cc' | 'subject' | 'body' | 'all';

export const EmailDraftModal: React.FC<EmailDraftModalProps> = ({
  isOpen,
  onClose,
  leave,
  settings,
  onOpenPrintView
}) => {
  const [copiedField, setCopiedField] = useState<CopyField | null>(null);

  if (!isOpen || !leave) return null;

  const draft = generateLeaveEmailDraft(leave, settings);

  const handleCopy = (field: CopyField, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField((current) => (current === field ? null : current)), 2000);
  };

  const allText = [
    ...(draft.to ? [`To: ${draft.to}`] : []),
    ...(draft.cc ? [`Cc: ${draft.cc}`] : []),
    `Subject: ${draft.subject}`,
    '',
    draft.body
  ].join('\n');

  const handleOpenMailClient = () => {
    window.location.href = draft.mailtoUrl;
  };

  const renderCopyIcon = (field: CopyField) =>
    copiedField === field ? <Check size={12} color="var(--accent-emerald)" /> : <Copy size={12} />;

  const smallCopyButtonStyle = { padding: '0.2rem 0.5rem', fontSize: '0.75rem' };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        {/* Header */}
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
              background: 'rgba(16, 185, 129, 0.12)',
              color: 'var(--accent-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Mail size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Official Email Draft</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Application logged! Send this notice to your manager & HR to complete your request.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-outline btn-icon-only" style={{ borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {/* Recipient Details */}
          <div style={{
            backgroundColor: 'var(--bg-surface-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1rem',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8125rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)', width: '60px', flexShrink: 0 }}>To:</span>
              <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>
                {draft.to || '<Not set in settings - configure manager email>'}
              </span>
              <button
                type="button"
                onClick={() => handleCopy('to', draft.to)}
                disabled={!draft.to}
                className="btn btn-secondary btn-sm"
                style={smallCopyButtonStyle}
              >
                {renderCopyIcon('to')}
                <span>{copiedField === 'to' ? 'Copied' : 'Copy To'}</span>
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)', width: '60px', flexShrink: 0 }}>Cc:</span>
              <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>
                {draft.cc || '<Not set in settings - configure HR email>'}
              </span>
              <button
                type="button"
                onClick={() => handleCopy('cc', draft.cc)}
                disabled={!draft.cc}
                className="btn btn-secondary btn-sm"
                style={smallCopyButtonStyle}
              >
                {renderCopyIcon('cc')}
                <span>{copiedField === 'cc' ? 'Copied' : 'Copy Cc'}</span>
              </button>
            </div>
          </div>

          {/* Subject with copy button */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Subject Line</label>
              <button
                type="button"
                onClick={() => handleCopy('subject', draft.subject)}
                className="btn btn-secondary btn-sm"
                style={smallCopyButtonStyle}
              >
                {renderCopyIcon('subject')}
                <span>{copiedField === 'subject' ? 'Copied' : 'Copy Subject'}</span>
              </button>
            </div>
            <input
              type="text"
              readOnly
              value={draft.subject}
              className="form-input"
              style={{ fontWeight: 600, backgroundColor: 'var(--bg-surface-subtle)' }}
            />
          </div>

          {/* Email Body with copy button */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Message Body</label>
              <button
                type="button"
                onClick={() => handleCopy('body', draft.body)}
                className="btn btn-secondary btn-sm"
                style={smallCopyButtonStyle}
              >
                {renderCopyIcon('body')}
                <span>{copiedField === 'body' ? 'Copied Body' : 'Copy Body'}</span>
              </button>
            </div>
            <textarea
              readOnly
              value={draft.body}
              className="form-textarea"
              style={{
                minHeight: '220px',
                fontFamily: 'inherit',
                fontSize: '0.8125rem',
                lineHeight: 1.6,
                backgroundColor: 'var(--bg-surface-subtle)',
                whiteSpace: 'pre-wrap'
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <button
              type="button"
              onClick={() => onOpenPrintView(leave)}
              className="btn btn-outline"
            >
              <Printer size={15} />
              <span>Print Form / Save PDF</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Done
              </button>
              <button
                type="button"
                onClick={() => handleCopy('all', allText)}
                className="btn btn-secondary"
              >
                {copiedField === 'all' ? <Check size={15} color="var(--accent-emerald)" /> : <Copy size={15} />}
                <span>{copiedField === 'all' ? 'Copied All' : 'Copy All'}</span>
              </button>
              <button
                id="btn-open-mailto"
                type="button"
                onClick={handleOpenMailClient}
                className="btn btn-primary"
              >
                <ExternalLink size={15} />
                <span>Open in Mail Client</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
