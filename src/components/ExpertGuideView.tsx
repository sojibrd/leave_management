'use client';

import React, { useState } from 'react';
import { 
  Compass, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Copy, 
  Check, 
  Calendar, 
  ArrowRight, 
  AlertTriangle, 
  Flame, 
  Briefcase, 
  MessageSquare,
  Clock,
  Layers
} from 'lucide-react';

interface ExpertGuideViewProps {
  onApplyForBridge?: (startDate: string, endDate: string, reason: string) => void;
}

export const ExpertGuideView: React.FC<ExpertGuideViewProps> = ({ onApplyForBridge }) => {
  const [activeSection, setActiveSection] = useState<'hacks' | 'edgecases' | 'handover' | 'ooo'>('hacks');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const holidayHacks = [
    {
      id: 'mar-sprint',
      title: 'Independence Day Ultra-Sprint (March 2026)',
      tag: '🔥 5 Days Leave = 11 Days Off',
      badgeColor: 'var(--accent-rose)',
      startDate: '2026-03-29',
      endDate: '2026-04-02',
      reason: 'Spring family vacation and recovery sprint',
      breakdown: [
        { date: 'Thu, 26 Mar', label: 'Independence Day (Holiday)', type: 'holiday' },
        { date: 'Fri-Sat, 27-28 Mar', label: 'Weekend Off', type: 'weekend' },
        { date: 'Sun-Thu, 29 Mar - 02 Apr', label: 'Take 5 Annual Leaves', type: 'leave' },
        { date: 'Fri-Sat, 03-04 Apr', label: 'Weekend Off', type: 'weekend' }
      ],
      description: 'By bridging Independence Day and two consecutive weekends with 5 days of Annual Leave, you get an uninterrupted 11-day mega break.'
    },
    {
      id: 'eid-bridge',
      title: 'Eid-ul-Fitr Golden Bridge (March 2026)',
      tag: '⚡ 2 Days Leave = 8 Days Off',
      badgeColor: 'var(--accent-amber)',
      startDate: '2026-03-22',
      endDate: '2026-03-23',
      reason: 'Eid celebrations with extended family',
      breakdown: [
        { date: 'Fri-Sat, 20-21 Mar', label: 'Weekend Off', type: 'weekend' },
        { date: 'Sun-Mon, 22-23 Mar', label: 'Take 2 Annual/Casual Leaves', type: 'leave' },
        { date: 'Tue-Thu, 24-26 Mar', label: 'Eid & Independence Holidays', type: 'holiday' },
        { date: 'Fri-Sat, 27-28 Mar', label: 'Weekend Off', type: 'weekend' }
      ],
      description: 'Taking just 2 bridge days adjacent to Eid holidays grants you an expansive 8 to 9 days to travel without peak rush.'
    },
    {
      id: 'dec-sprint',
      title: 'Victory Day & Year-End Recharge (December 2026)',
      tag: '❄️ 3 Days Leave = 7 Days Off',
      badgeColor: 'var(--primary)',
      startDate: '2026-12-13',
      endDate: '2026-12-15',
      reason: 'Year-end personal recharge and travel',
      breakdown: [
        { date: 'Fri-Sat, 11-12 Dec', label: 'Weekend Off', type: 'weekend' },
        { date: 'Sun-Tue, 13-15 Dec', label: 'Take 3 Annual Leaves', type: 'leave' },
        { date: 'Wed, 16 Dec', label: 'Victory Day (Holiday)', type: 'holiday' }
      ],
      description: 'Combine Victory Day with 3 days of leave to recharge your mental battery before closing annual objectives.'
    }
  ];

  const edgeCases = [
    {
      icon: <Layers size={20} color="var(--accent-rose)" />,
      title: '1. Date Collisions & Overlapping Applications',
      rule: 'Total leave on any calendar date cannot exceed 1.0 day.',
      details: 'The system strictly blocks overlapping dates with existing Pending/Approved leaves. However, complementary half-days (e.g. Morning Half + Afternoon Half) on the same date are intelligently allowed.'
    },
    {
      icon: <Calendar size={20} color="var(--primary)" />,
      title: '2. Weekend & Public Holiday Boundary Collision',
      rule: 'Non-working days are strictly excluded from quota deductions.',
      details: 'Selecting Thursday to Monday only deducts 2 working days (Thursday & Sunday), safely skipping Friday and Saturday weekends and any intermediate official holidays.'
    },
    {
      icon: <Clock size={20} color="var(--accent-amber)" />,
      title: '3. The Sandwich Rule Matrix',
      rule: 'Deducting intervening weekends/holidays when taking contiguous leaves.',
      details: 'In organizations enforcing strict sandwich rules, taking Thursday and Sunday leaves deducts 4 days instead of 2. In this system, standard non-working days remain protected by default.'
    },
    {
      icon: <Flame size={20} color="var(--accent-emerald)" />,
      title: '4. Quota Exhaustion & LOP (Leave Without Pay)',
      rule: 'Graceful overflow into Unpaid Leave / LOP rather than silent loss.',
      details: 'When requesting more days than your remaining balance, the system displays an amber LOP warning and flags the exceeded portion for HR processing.'
    },
    {
      icon: <Sparkles size={20} color="#8b5cf6" />,
      title: '5. Cross-Year Crossover (Dec 31 - Jan 1)',
      rule: 'Deterministic multi-year partition.',
      details: 'Leaves crossing from December into January are split across respective calendar years so quotas deduct from the appropriate annual allowance without carry-forward confusion.'
    },
    {
      icon: <ShieldCheck size={20} color="#06b6d4" />,
      title: '6. Atomic Quota Reservation Invariant',
      rule: 'Available = Quota - Approved - Pending.',
      details: 'Pending applications instantly reserve days from the available quota, making it mathematically impossible to double-spend leave balances.'
    }
  ];

  const oooTemplates = [
    {
      id: 'slack-status',
      title: 'Internal Slack / Microsoft Teams Status',
      text: '🌴 OOO: Returning on [Date] | Primary Backup: @[ColleagueName] | Emergency: Call mobile'
    },
    {
      id: 'client-autoresponder',
      title: 'External Client Email Auto-Responder',
      text: `Subject: Out of Office: [Your Name] until [Date]

Hello,

Thank you for your email. I am currently out of the office on scheduled leave, returning on [Date].

During this period, I will have limited/no access to email.

For urgent matters regarding:
- [Project Name]: Please contact [Backup Name] ([backup@company.com])
- General / Operational inquiries: Please reach out to [team@company.com]

I will respond to your message promptly upon my return.

Best regards,
[Your Name]
[Your Title]`
    },
    {
      id: 'handover-brief',
      title: 'Internal Handover Briefing to Team',
      text: `Hi Team,

I will be on leave from [Start Date] to [End Date], returning to office on [Return Date].

Key Project Handover:
1. [Project A]: All in-flight PRs merged. [Colleague Name] will handle client check-in.
2. [Project B]: Sprint deliverables completed. Runbook is documented at [Link].
3. Emergency Escalation: Only contact via phone for P1 critical production issues.

Thank you!`
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div style={{ maxWidth: '650px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Compass size={22} color="var(--primary)" />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Master Reference & Strategic Handbook
            </span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Manage Leaves Like an Expert
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Maximize your personal recovery time through intelligent holiday bridging, zero-friction team handovers, and rock-solid system edge-case protection.
          </p>
        </div>

        {/* Section Switcher Pills */}
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--bg-surface)',
          padding: '0.35rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          gap: '0.25rem',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setActiveSection('hacks')}
            className={`btn btn-sm ${activeSection === 'hacks' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: activeSection === 'hacks' ? undefined : 'none' }}
          >
            <Sparkles size={14} />
            <span>2026 Holiday Hacks</span>
          </button>
          <button
            onClick={() => setActiveSection('edgecases')}
            className={`btn btn-sm ${activeSection === 'edgecases' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: activeSection === 'edgecases' ? undefined : 'none' }}
          >
            <ShieldCheck size={14} />
            <span>Edge Case Matrix</span>
          </button>
          <button
            onClick={() => setActiveSection('handover')}
            className={`btn btn-sm ${activeSection === 'handover' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: activeSection === 'handover' ? undefined : 'none' }}
          >
            <Briefcase size={14} />
            <span>Handover Checklist</span>
          </button>
          <button
            onClick={() => setActiveSection('ooo')}
            className={`btn btn-sm ${activeSection === 'ooo' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: activeSection === 'ooo' ? undefined : 'none' }}
          >
            <MessageSquare size={14} />
            <span>OOO Templates</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: 2026 HOLIDAY HACKS */}
      {activeSection === 'hacks' && (
        <div>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              Strategic Holiday Bridging (Bangladesh 2026)
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Combine public holidays and weekends with minimal annual leaves to unlock long vacation sprints.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {holidayHacks.map((hack) => (
              <div
                key={hack.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: 'var(--bg-surface-subtle)',
                      border: `1px solid ${hack.badgeColor}`,
                      color: hack.badgeColor,
                      padding: '0.25rem 0.6rem',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                      {hack.tag}
                    </span>
                    <Flame size={18} color={hack.badgeColor} />
                  </div>

                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                    {hack.title}
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
                    {hack.description}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.25rem' }}>
                    {hack.breakdown.map((b, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.75rem',
                          padding: '0.4rem 0.6rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: b.type === 'leave'
                            ? 'rgba(99, 102, 241, 0.1)'
                            : b.type === 'holiday'
                              ? 'rgba(245, 158, 11, 0.1)'
                              : 'var(--bg-surface-subtle)',
                          borderLeft: `3px solid ${
                            b.type === 'leave' ? 'var(--primary)' : b.type === 'holiday' ? 'var(--accent-amber)' : 'var(--text-muted)'
                          }`
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>{b.date}</span>
                        <span style={{ color: b.type === 'leave' ? 'var(--primary)' : 'var(--text-secondary)' }}>
                          {b.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {onApplyForBridge && (
                  <button
                    onClick={() => onApplyForBridge(hack.startDate, hack.endDate, hack.reason)}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <span>Apply for this Sprint</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: EDGE CASE MATRIX */}
      {activeSection === 'edgecases' && (
        <div>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              System Edge Case Matrix & Business Rules
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              How our leave engine guarantees mathematical precision, zero duplicate bookings, and data integrity.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {edgeCases.map((ec, idx) => (
              <div
                key={idx}
                className="card"
                style={{
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.35rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div style={{
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {ec.icon}
                  </div>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>
                    {ec.title}
                  </h4>
                </div>

                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--bg-surface-subtle)',
                  padding: '0.35rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--primary)'
                }}>
                  Rule: {ec.rule}
                </div>

                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {ec.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: HANDOVER CHECKLIST */}
      {activeSection === 'handover' && (
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              The Ironclad Handover Checklist
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Complete these steps before starting your scheduled leave to ensure zero stress and uninterrupted project velocity.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div style={{
              backgroundColor: 'var(--bg-surface-subtle)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--accent-emerald)' }}>
                1. Alignment (3-5 Days Before)
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--accent-emerald)" />
                  <span>Brief designated primary and secondary backup colleagues.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--accent-emerald)" />
                  <span>Inform sprint lead about capacity reduction.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--accent-emerald)" />
                  <span>Reschedule or delegate upcoming calendar meetings.</span>
                </li>
              </ul>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-surface-subtle)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--primary)' }}>
                2. Execution (1 Day Before)
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--primary)" />
                  <span>Merge or cleanly park all in-flight PRs / code branches.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--primary)" />
                  <span>Publish written handover notes in Slack channel.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--primary)" />
                  <span>Set up email auto-responder and calendar out-of-office.</span>
                </li>
              </ul>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-surface-subtle)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--accent-amber)' }}>
                3. Boundaries (During Absence)
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--accent-amber)" />
                  <span>Sign out of Slack and email on personal phone.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--accent-amber)" />
                  <span>Strict rule: Mobile phone calls only for P1 outages.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--accent-amber)" />
                  <span>Return refreshed with zero unfinished task debt.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: OOO TEMPLATES */}
      {activeSection === 'ooo' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              Executive Out-Of-Office (OOO) Templates
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Ready-to-use communication templates for Slack, client auto-responders, and internal team memos.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {oooTemplates.map((t) => (
              <div
                key={t.id}
                className="card"
                style={{
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {t.title}
                  </span>
                  <button
                    onClick={() => copyToClipboard(t.text, t.id)}
                    className="btn btn-secondary btn-sm"
                  >
                    {copiedId === t.id ? (
                      <>
                        <Check size={14} color="var(--accent-emerald)" />
                        <span style={{ color: 'var(--accent-emerald)' }}>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy Template</span>
                      </>
                    )}
                  </button>
                </div>

                <pre style={{
                  backgroundColor: 'var(--bg-surface-subtle)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                  margin: 0
                }}>
                  {t.text}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
