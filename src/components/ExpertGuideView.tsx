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
      title: 'স্বাধীনতা দিবস আল্ট্রা-স্প্রিন্ট (মার্চ ২০২৬)',
      tag: '🔥 ৫ দিন ছুটি = ১১ দিন ভ্যাকেশন',
      badgeColor: 'var(--accent-rose)',
      startDate: '2026-03-29',
      endDate: '2026-04-02',
      reason: 'স্বাধীনতা দিবস সংলগ্ন পারিবারিক অবকাশ ও রিচার্জ স্প্রিন্ট',
      breakdown: [
        { date: '২৬ মার্চ (বৃহস্পতি)', label: 'স্বাধীনতা দিবস (সরকারি ছুটি)', type: 'holiday' },
        { date: '২৭-২৮ মার্চ (শুক্র-শনি)', label: 'সাপ্তাহিক ছুটি (উইকেন্ড)', type: 'weekend' },
        { date: '২৯ মার্চ - ০২ এপ্রিল (রবি-বৃহস্পতি)', label: '৫ দিন Annual Leave নিন', type: 'leave' },
        { date: '০৩-০৪ এপ্রিল (শুক্র-শনি)', label: 'সাপ্তাহিক ছুটি (উইকেন্ড)', type: 'weekend' }
      ],
      description: 'স্বাধীনতা দিবস ও দুই সপ্তাহের উইকেন্ডের সাথে মাত্র ৫ দিনের বাৎসরিক ছুটি ব্রিজিং করে টানা ১১ দিনের নিরবচ্ছিন্ন ছুটি উপভোগ করুন।'
    },
    {
      id: 'eid-bridge',
      title: 'ঈদুল ফিতর গোল্ডেন ব্রিজ (মার্চ ২০২৬)',
      tag: '⚡ ২ দিন ছুটি = ৮ দিন ভ্যাকেশন',
      badgeColor: 'var(--accent-amber)',
      startDate: '2026-03-22',
      endDate: '2026-03-23',
      reason: 'ঈদের উদযাপন ও পরিবারের সাথে সময় কাটানো',
      breakdown: [
        { date: '২০-২১ মার্চ (শুক্র-শনি)', label: 'সাপ্তাহিক ছুটি (উইকেন্ড)', type: 'weekend' },
        { date: '২২-২৩ মার্চ (রবি-সোম)', label: '২ দিন Annual/Casual Leave নিন', type: 'leave' },
        { date: '২৪-২৬ মার্চ (মঙ্গল-বৃহস্পতি)', label: 'ঈদ ও স্বাধীনতা দিবসের সরকারি ছুটি', type: 'holiday' },
        { date: '২৭-২৮ মার্চ (শুক্র-শনি)', label: 'সাপ্তাহিক ছুটি (উইকেন্ড)', type: 'weekend' }
      ],
      description: 'ঈদের সরকারি ছুটির আগে মাত্র ২ দিনের ব্রিজ লিভ নিয়ে যাতায়াতের প্রচণ্ড ভিড় এড়িয়ে টানা ৮ দিনের স্বস্তিদায়ক ছুটি পান।'
    },
    {
      id: 'dec-sprint',
      title: 'বিজয় দিবস ও ইয়ার-এন্ড রিচার্জ (ডিসেম্বর ২০২৬)',
      tag: '❄️ ৩ দিন ছুটি = ৭ দিন অফ',
      badgeColor: 'var(--primary)',
      startDate: '2026-12-13',
      endDate: '2026-12-15',
      reason: 'বাৎসরিক কাজের ক্লান্তি দূর করতে ইয়ার-এন্ড ট্রাভেল',
      breakdown: [
        { date: '১১-১২ ডিসেম্বর (শুক্র-শনি)', label: 'সাপ্তাহিক ছুটি (উইকেন্ড)', type: 'weekend' },
        { date: '১৩-১৫ ডিসেম্বর (রবি-মঙ্গল)', label: '৩ দিন Annual Leave নিন', type: 'leave' },
        { date: '১৬ ডিসেম্বর (বুধ)', label: 'বিজয় দিবস (সরকারি ছুটি)', type: 'holiday' }
      ],
      description: 'বিজয় দিবসের সাথে ৩ দিনের ছুটি মিলিয়ে বাৎসরিক লক্ষ্যমাত্রা সমাপ্তির আগে নিজের মানসিক শক্তি রিচার্জ করে নিন।'
    }
  ];

  const edgeCases = [
    {
      icon: <Layers size={20} color="var(--accent-rose)" />,
      title: '১. তারিখের সংঘাত ও Overlapping Applications',
      rule: 'একই ক্যালেন্ডার তারিখে মোট ছুটি ১.০ দিনের বেশি হতে পারবে না।',
      details: 'বিদ্যমান Pending বা Approved ছুটির তারিখের সাথে নতুন আবেদন ওভারল্যাপ করলে সিস্টেম সাথে সাথে ব্লক করে। তবে একই দিনে Morning Half এবং Afternoon Half-এর মতো Complementary Half-Day আবেদন স্বয়ংক্রিয়ভাবে অনুমোদন পায়।'
    },
    {
      icon: <Calendar size={20} color="var(--primary)" />,
      title: '২. উইকেন্ড ও সরকারি ছুটির সীমানা সংঘর্ষ',
      rule: 'ছুটির দিনগুলো কখনোই কোটা ডেডাকশনে অন্তর্ভুক্ত হয় না।',
      details: 'বৃহস্পতি থেকে রবিবার আবেদন করলে সিস্টেম শুক্রবার ও শনিবার বাদ দিয়ে কেবল ২ কর্মদিবস (বৃহস্পতি ও রবিবার) হিসাব করে।'
    },
    {
      icon: <Clock size={20} color="var(--accent-amber)" />,
      title: '৩. স্যান্ডউইচ রুল (The Sandwich Rule)',
      rule: 'টানা ছুটির মাঝখানের উইকেন্ডও ছুটি গণ্য হওয়ার নীতি।',
      details: 'যেসব প্রতিষ্ঠানে কঠোর Sandwich Rule রয়েছে, সেখানে বৃহস্পতি ও রবিবার ছুটি নিলে মাঝের শুক্র-শনি মিলিয়ে ৪ দিন কর্তন হয়। আমাদের সিস্টেমে উইকেন্ড সবসময় সুরক্ষিত থাকে।'
    },
    {
      icon: <Flame size={20} color="var(--accent-emerald)" />,
      title: '৪. কোটা শেষ ও LOP (Leave Without Pay)',
      rule: 'কোটা অতিক্রম করলে স্বয়ংক্রিয় সতর্কতা ও অবৈতনিক লিভ হিসেবে রূপান্তর।',
      details: 'অবশিষ্ট ব্যালেন্সের চেয়ে বেশি দিন আবেদন করলে সিস্টেম অ্যাম্বার সতর্কতা দেখায় এবং অতিরিক্ত দিনগুলো Unpaid Leave হিসেবে এইচআর প্রক্রিয়াকরণের জন্য প্রস্তুত করে।'
    },
    {
      icon: <Sparkles size={20} color="#8b5cf6" />,
      title: '৫. বছর পরিবর্তনের সীমানা (Dec 31 - Jan 1 Crossover)',
      rule: 'স্বয়ংক্রিয় বাৎসরিক পার্টিশনিং (Year Splitting)।',
      details: 'ডিসেম্বর থেকে জানুয়ারিতে বিস্তৃত ছুটির আবেদনগুলোকে স্বয়ংক্রিয়ভাবে সংশ্লিষ্ট বছরের কোটায় ভাগ করা হয় যাতে Carry-Forward ছাড়া সঠিক কোটা কর্তন নিশ্চিত হয়।'
    },
    {
      icon: <ShieldCheck size={20} color="#06b6d4" />,
      title: '৬. অ্যাটমিক কোটা রিজার্ভেশন (Atomic Reservation)',
      rule: 'Available = Total Quota - Approved - Pending।',
      details: 'Pending থাকা অবস্থাতেই কোটা রিজার্ভ হয়ে যায়, ফলে একই কোটার বিপরীতে একাধিক সমান্তরাল আবেদন সাবমিট করা অসম্ভব।'
    }
  ];

  const oooTemplates = [
    {
      id: 'slack-status',
      title: 'অভ্যন্তরীণ স্ল্যাক / মাইক্রোসফট টিমস স্ট্যাটাস',
      text: '🌴 OOO: Returning on [তারিখ] | Primary Backup: @[সহকর্মীর নাম] | Emergency: Call mobile'
    },
    {
      id: 'client-autoresponder',
      title: 'এক্সটার্নাল ক্লায়েন্টদের জন্য ইমেইল অটো-রেসপন্ডার',
      text: `Subject: Out of Office: [আপনার নাম] until [ফেরার তারিখ]

Hello,

Thank you for your email. I am currently out of the office on scheduled leave, returning on [ফেরার তারিখ].

During this period, I will have limited/no access to email.

For urgent matters regarding:
- [প্রোজেক্টের নাম]: Please contact [ব্যাকআপ ব্যক্তির নাম] ([backup@company.com])
- General / Operational inquiries: Please reach out to [team@company.com]

I will respond to your message promptly upon my return.

Best regards,
[আপনার নাম]
[আপনার পদবি]`
    },
    {
      id: 'handover-brief',
      title: 'টিম চ্যানেলে ছুটির হ্যান্ডওভার নোটিশ',
      text: `Hi Team,

আমি [শুরুর তারিখ] থেকে [শেষের তারিখ] পর্যন্ত ছুটিতে থাকব এবং [অফিসে ফেরার তারিখ] অফিসে উপস্থিত হব।

প্রোজেক্ট হ্যান্ডওভার সামারি:
১. [প্রোজেক্ট A]: সকল চলমান Pull Request মার্জ করা হয়েছে। ক্লায়েন্ট ফলো-আপের দায়িত্ব [সহকর্মীর নাম]-এর কাছে রয়েছে।
২. [প্রোজেক্ট B]: বর্তমান স্প্রিন্টের কাজ সম্পন্ন। প্রয়োজনীয় গাইডলাইন [ডকুমেন্ট লিংক]-এ দেওয়া আছে।
৩. ইমার্জেন্সি যোগাযোগ: কেবল P1 প্রোডাকশন ক্রিটিক্যাল সমস্যা ছাড়া মোবাইলে যোগাযোগ না করার অনুরোধ রইল।

ধন্যবাদ!`
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
              মাস্টার রেফারেন্স ও স্ট্র্যাটেজিক প্লেবুক
            </span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            দক্ষভাবে ছুটি ব্যবস্থাপনা (Manage Leave Like an Expert)
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            স্মার্ট হলিডে ব্রিজিং, নিবিড় হ্যান্ডওভার প্রোটোকল এবং শক্তিশালী সিস্টেম এজ-কেস সুরক্ষার মাধ্যমে নিজের জন্য সর্বোচ্চ বিশ্রামের সুযোগ নিশ্চিত করুন।
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
            <span>২০২৬ হলিডে হ্যাকস</span>
          </button>
          <button
            onClick={() => setActiveSection('edgecases')}
            className={`btn btn-sm ${activeSection === 'edgecases' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: activeSection === 'edgecases' ? undefined : 'none' }}
          >
            <ShieldCheck size={14} />
            <span>Edge Case ম্যাট্রিক্স</span>
          </button>
          <button
            onClick={() => setActiveSection('handover')}
            className={`btn btn-sm ${activeSection === 'handover' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: activeSection === 'handover' ? undefined : 'none' }}
          >
            <Briefcase size={14} />
            <span>হ্যান্ডওভার চেকলিস্ট</span>
          </button>
          <button
            onClick={() => setActiveSection('ooo')}
            className={`btn btn-sm ${activeSection === 'ooo' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: activeSection === 'ooo' ? undefined : 'none' }}
          >
            <MessageSquare size={14} />
            <span>OOO টেমপ্লেট</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: 2026 HOLIDAY HACKS */}
      {activeSection === 'hacks' && (
        <div>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              কৌশলগত ছুটি ব্রিজিং (বাংলাদেশ ২০২৬)
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              সরকারি ছুটি ও উইকেন্ডের সাথে মিলিয়ে সামান্য ছুটি খরচ করে দীর্ঘ ভ্যাকেশন আনলক করুন।
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
                    <span>এই স্প্রিন্টের জন্য আবেদন করুন</span>
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
              সিস্টেম Edge Case ম্যাট্রিক্স ও বিজনেস রুলস
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              আমাদের লিভ ক্যালকুলেশন ইঞ্জিন কীভাবে নির্ভুলতা ও ডুপ্লিকেট প্রতিরোধ নিশ্চিত করে।
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
                  রুল: {ec.rule}
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
              নিখুঁত হ্যান্ডওভার চেকলিস্ট (Ironclad Handover)
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              ছুটিতে যাওয়ার পূর্বে এই ধাপগুলো নিশ্চিত করুন যাতে আপনার অনুপস্থিতিতেও কাজ নিরবচ্ছিন্ন থাকে।
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
                ১. প্রস্তুতি ও ব্রিফিং (৩-৫ দিন পূর্বে)
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--accent-emerald)" />
                  <span>প্রাইমারি ও সেকেন্ডারি ব্যাকআপ সহকর্মীদের সম্পূর্ণ কাজের ব্রিফিং দিন।</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--accent-emerald)" />
                  <span>স্প্রিন্ট লিডকে অনুপস্থিতির কারণে ক্যাপাসিটি রিডাকশন সম্পর্কে জানান।</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--accent-emerald)" />
                  <span>আসন্ন মিটিংগুলো রিসিডিউল করুন অথবা সহকর্মীদের প্রতিনিধি হিসেবে পাঠান।</span>
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
                ২. বাস্তবায়ন ও পার্কিং (১ দিন পূর্বে)
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--primary)" />
                  <span>চলমান সব Pull Request মার্জ করুন অথবা কোড ক্লিন অবস্থায় পার্ক করুন।</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--primary)" />
                  <span>স্ল্যাক বা টিমস চ্যানেলে লিখিত হ্যান্ডওভার নোট পোস্ট করুন।</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--primary)" />
                  <span>ইমেইল অটো-রেসপন্ডার ও ক্যালেন্ডারে Out-of-Office সেট করুন।</span>
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
                ৩. ছুটির সময়ে সচেতনতা (During Absence)
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--accent-amber)" />
                  <span>ব্যক্তিগত ফোন থেকে কাজের স্ল্যাক ও ইমেইল নোটিফিকেশন অফ রাখুন।</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--accent-amber)" />
                  <span>কঠোর নিয়ম: কেবল P1 প্রোডাকশন ডাউন হলে মোবাইলে ফোন করা যাবে।</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--accent-amber)" />
                  <span>ছুটি শেষে সম্পূর্ণ ফুরফুরে মনে অফিসে ফিরুন।</span>
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
              প্রফেশনাল আউট-অফ-অফিস (OOO) টেমপ্লেট
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              স্ল্যাক স্ট্যাটাস, ক্লায়েন্ট অটো-রেসপন্ডার এবং টিম মেমোর জন্য রেডিমেড টেমপ্লেট।
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
                        <span style={{ color: 'var(--accent-emerald)' }}>কপি হয়েছে!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>কপি করুন</span>
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
