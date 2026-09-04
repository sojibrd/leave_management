'use client';

import React, { useState, useMemo } from 'react';
import { UserSettings } from '../types/leave';
import { findOptimalHolidayBridges, toDateString } from '../lib/calculator';
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
  settings?: UserSettings;
  selectedYear?: number;
  onOpenSettings?: () => void;
}

export const ExpertGuideView: React.FC<ExpertGuideViewProps> = ({
  onApplyForBridge,
  settings,
  selectedYear = new Date().getFullYear(),
  onOpenSettings
}) => {
  const todayStr = useMemo(() => toDateString(new Date()), []);
  const [activeSection, setActiveSection] = useState<'hacks' | 'edgecases' | 'handover' | 'ooo'>('hacks');
  const [showPastHacks, setShowPastHacks] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Dynamically calculate optimal holiday bridge hacks based on configured holidays, weekends, and year!
  const allHolidayHacks = useMemo(() => {
    const holidays = settings?.customHolidays || [];
    const weekends = settings?.weekendDays || [5, 6];
    return findOptimalHolidayBridges(holidays, weekends, selectedYear);
  }, [settings?.customHolidays, settings?.weekendDays, selectedYear]);

  // Filter only upcoming hacks where the leave/holiday period hasn't ended yet
  const upcomingHacks = useMemo(() => {
    return allHolidayHacks.filter((hack) => hack.endDate >= todayStr);
  }, [allHolidayHacks, todayStr]);

  const pastHacksCount = allHolidayHacks.length - upcomingHacks.length;
  const displayedHacks = showPastHacks ? allHolidayHacks : upcomingHacks;

  const edgeCases = [
    {
      icon: <Layers size={20} color="var(--accent-rose)" />,
      title: '1. Date Conflicts & Overlapping Applications',
      rule: 'Total leave on the same calendar date cannot exceed 1.0 day.',
      details: 'A new application that overlaps with an existing Pending or Approved leave date is blocked immediately. Complementary half-day applications on the same date — such as a Morning Half and an Afternoon Half — are auto-approved, since together they still sum to exactly one day.'
    },
    {
      icon: <Calendar size={20} color="var(--primary)" />,
      title: '2. Weekend & Public Holiday Boundary Overlap',
      rule: 'Off-days never count toward quota deduction.',
      details: 'Applying from Thursday to Sunday, the system excludes Friday and Saturday and deducts only the 2 working days (Thursday and Sunday).'
    },
    {
      icon: <Clock size={20} color="var(--accent-amber)" />,
      title: '3. The Sandwich Rule',
      rule: 'The policy of counting the weekend sandwiched between two leave days as leave too.',
      details: 'Organizations with a strict Sandwich Rule deduct 4 days if you take Thursday and Sunday off, including the Friday-Saturday in between. In our system, the weekend is always protected.'
    },
    {
      icon: <Flame size={20} color="var(--accent-emerald)" />,
      title: '4. Quota Exhaustion & LOP (Leave Without Pay)',
      rule: 'Automatic warning and conversion to unpaid leave when quota is exceeded.',
      details: 'Applying for more days than the remaining balance triggers an amber warning, and the excess days are marked as Unpaid Leave, ready for HR processing.'
    },
    {
      icon: <Sparkles size={20} color="#8b5cf6" />,
      title: '5. Year-Boundary Crossover (Dec 31 - Jan 1)',
      rule: 'Automatic yearly partitioning (Year Splitting).',
      details: 'Leave applications spanning December into January are automatically split across each year\'s own quota, ensuring correct deduction with no carry-forward.'
    },
    {
      icon: <ShieldCheck size={20} color="var(--accent-cyan)" />,
      title: '6. Atomic Quota Reservation',
      rule: 'Available = Total Quota - Approved - Pending.',
      details: 'Quota is reserved the moment a leave becomes Pending, making it impossible to submit multiple parallel applications against the same quota.'
    }
  ];

  const oooTemplates = [
    {
      id: 'slack-status',
      title: 'Internal Slack / Microsoft Teams Status',
      text: '🌴 OOO: Returning on [date] | Primary Backup: @[colleague name] | Emergency: Call mobile'
    },
    {
      id: 'client-autoresponder',
      title: 'Email Auto-Responder for External Clients',
      text: `Subject: Out of Office: [Your Name] until [Return Date]

Hello,

Thank you for your email. I am currently out of the office on scheduled leave, returning on [Return Date].

During this period, I will have limited/no access to email.

For urgent matters regarding:
- [Project Name]: Please contact [Backup Person's Name] ([backup@company.com])
- General / Operational inquiries: Please reach out to [team@company.com]

I will respond to your message promptly upon my return.

Best regards,
[Your Name]
[Your Designation]`
    },
    {
      id: 'handover-brief',
      title: 'Leave Handover Notice for the Team Channel',
      text: `Hi Team,

I will be on leave from [start date] to [end date], and will be back in the office on [return date].

Project handover summary:
1. [Project A]: All open Pull Requests have been merged. Client follow-up is with [colleague name].
2. [Project B]: Current sprint work is complete. Required guidelines are in [document link].
3. Emergency contact: Please avoid contacting me on mobile except for P1 production-critical issues.

Thanks!`
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 176, 32, 0.12) 0%, rgba(169, 122, 214, 0.12) 100%)',
        border: '1px solid rgba(255, 176, 32, 0.25)',
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
              Master Reference & Strategic Playbook
            </span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Manage Leave Like an Expert
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Secure maximum rest for yourself with smart holiday bridging, disciplined handover protocols, and robust system edge-case protection.
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
            <span>{selectedYear} Upcoming Hacks ({upcomingHacks.length})</span>
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

      {/* SECTION 1: DYNAMIC HOLIDAY HACKS (UPCOMING ONLY BY DEFAULT) */}
      {activeSection === 'hacks' && (
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '1.25rem'
          }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                {showPastHacks ? `All Holiday Bridges (${selectedYear})` : `Upcoming Strategic Holiday Bridges (${selectedYear})`}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                {showPastHacks
                  ? `Showing all ${allHolidayHacks.length} opportunities this year, past and upcoming combined.`
                  : `Showing the best upcoming vacation sprints from today onward (past holidays are excluded automatically).`}
              </p>
            </div>

            {pastHacksCount > 0 && (
              <button
                onClick={() => setShowPastHacks(!showPastHacks)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem' }}
                title="Toggle showing or hiding past opportunities"
              >
                <span>{showPastHacks ? 'Show upcoming only' : `Show ${pastHacksCount} past`}</span>
              </button>
            )}
          </div>

          {displayedHacks.length === 0 ? (
            <div style={{
              backgroundColor: 'var(--bg-surface-subtle)',
              border: '1px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <Calendar size={36} color="var(--primary)" />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                No upcoming leave-bridging opportunities left for {selectedYear}
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '480px', lineHeight: 1.5 }}>
                {pastHacksCount > 0
                  ? `${pastHacksCount} opportunities earlier this year have already passed. You can add new custom holidays from Settings for upcoming dates.`
                  : 'Add a new public or custom holiday from Settings and the system will automatically generate the best holiday-bridging opportunities here.'}
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {pastHacksCount > 0 && !showPastHacks && (
                  <button onClick={() => setShowPastHacks(true)} className="btn btn-secondary btn-sm">
                    <span>Show {pastHacksCount} past</span>
                  </button>
                )}
                {onOpenSettings && (
                  <button onClick={onOpenSettings} className="btn btn-primary btn-sm">
                    <span>Add holidays from Settings</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {displayedHacks.map((hack) => (
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
                            ? 'rgba(169, 122, 214, 0.1)'
                            : b.type === 'holiday'
                              ? 'rgba(255, 176, 32, 0.1)'
                              : 'var(--bg-surface-subtle)',
                          borderLeft: `3px solid ${
                            b.type === 'leave' ? 'var(--accent-purple)' : b.type === 'holiday' ? 'var(--accent-amber)' : 'var(--text-muted)'
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
                    <span>Apply for this sprint</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
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
              How our leave calculation engine ensures accuracy and prevents duplicates.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
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
              Ironclad Handover Checklist
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Confirm these steps before going on leave so work stays uninterrupted in your absence.
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
                1. Preparation & Briefing (3-5 days before)
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--accent-emerald)" />
                  <span>Give the primary and secondary backup colleagues a complete work briefing.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--accent-emerald)" />
                  <span>Inform the sprint lead about the capacity reduction due to your absence.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--accent-emerald)" />
                  <span>Reschedule upcoming meetings or send a colleague as your delegate.</span>
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
                2. Execution & Parking (1 day before)
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--primary)" />
                  <span>Merge all open Pull Requests or park code in a clean state.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--primary)" />
                  <span>Post a written handover note in the Slack or Teams channel.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--primary)" />
                  <span>Set up the email auto-responder and Out-of-Office on your calendar.</span>
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
                3. Staying Off During Absence
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--accent-amber)" />
                  <span>Turn off work Slack and email notifications on your personal phone.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--accent-amber)" />
                  <span>Strict rule: only call the mobile for a P1 production-down incident.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--accent-amber)" />
                  <span>Return to the office fully refreshed once leave is over.</span>
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
              Professional Out-of-Office (OOO) Templates
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Ready-made templates for Slack status, client auto-responders, and team memos.
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
                        <span>Copy</span>
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
