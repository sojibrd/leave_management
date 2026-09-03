/**
 * Real-world leave reason suggestions per leave type code.
 * Shown as clickable chips in ApplyLeaveModal to help users
 * fill in professional, realistic reasons quickly.
 */
export const LEAVE_REASON_SUGGESTIONS: Record<string, string[]> = {
  CL: [
    'Attending sibling\'s wedding ceremony in hometown — 2-day family event',
    'Personal urgent errand — renewing NID and passport documents at district office',
    'Accompanying parents to specialist doctor appointment at BSMMU',
    'Handling property registration and deed signing at sub-registrar office',
    'Moving to new residence — packing, transport, and logistics coordination',
    'Child school admission process — interview and document submission',
    'Family guests arriving from abroad — airport reception and settling in',
    'Bank loan documentation and in-person KYC verification',
    'Attending close relative\'s funeral and family bereavement obligations',
    'Home utility emergency — gas line repair and plumber/electrician visit',
  ],
  SL: [
    'High fever (102°F) with body ache — resting at home under doctor\'s advice',
    'Dental surgery — post-procedure recovery and swelling management',
    'Severe gastroenteritis — dehydration, vomiting, and bed rest required',
    'Eye infection (conjunctivitis) — doctor recommended avoiding screen exposure',
    'Acute migraine episode — light sensitivity and severe headache, unable to work',
    'Viral flu with sore throat, congestion, and fatigue — prescribed rest for 2 days',
    'Lower back injury — physiotherapy sessions and rest as advised by orthopedic',
    'Allergic reaction — skin rash and swelling requiring antihistamine treatment',
    'Blood pressure fluctuation — cardiac checkup, ECG, and observation at clinic',
    'Food poisoning — nausea, weakness, and IV fluids required, recovering at home',
  ],
  AL: [
    'Annual family vacation to Cox\'s Bazar — planned holiday with spouse and children',
    'Extended Eid holiday — travelling to village to spend time with parents and family',
    'International travel — leisure trip with spouse, visa appointment included',
    'Planned mental health break — personal rest, recharge, and no-screen detox week',
    'Wedding anniversary trip — short getaway with spouse',
    'Attending cousin\'s wedding in Chittagong — 4-day family event and reunion',
    'Children\'s school summer vacation — family bonding and day trips',
    'Home renovation supervision — interior work, contractor coordination, 5 days',
    'Visiting in-laws during Puja holiday — extended stay in hometown',
    'Attending sibling\'s university graduation ceremony — travel and family gathering',
  ],
  CO: [
    'Compensating for working last Friday during critical product launch weekend',
    'Taking off in lieu of Saturday overtime during Q4 release sprint',
    'Rest after emergency production deployment handled on Saturday night',
    'Compensating for Sunday shift worked during urgent client data migration',
    'Taking off in lieu of national holiday worked to meet project deadline',
    'Rest after 3 consecutive weekend shifts during system-wide infrastructure upgrade',
    'Compensating for working on Eid day due to high-priority bug fix and hotfix release',
    'Taking off after extended late-night weekend hours for major version release',
    'Rest day for working Victory Day during project crunch and stakeholder demo',
    'Compensating for Saturday worked to prepare and rehearse for client presentation',
  ],
};

/**
 * Returns suggestions for a given leave type code.
 * Falls back to an empty array if no suggestions are defined.
 */
export function getSuggestionsForType(leaveTypeCode: string): string[] {
  return LEAVE_REASON_SUGGESTIONS[leaveTypeCode] ?? [];
}
