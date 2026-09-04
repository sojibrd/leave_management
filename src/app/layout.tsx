import type { Metadata, Viewport } from 'next';
import {
  Barlow_Semi_Condensed,
  JetBrains_Mono,
  Noto_Sans_Bengali,
} from 'next/font/google';
import './globals.css';

/* Same font family as system_design's control-room theme — condensed
   engraved sans for UI, mono for readouts/labels, Bengali for the guide
   content the Latin faces carry no glyphs for. */
const condensed = Barlow_Semi_Condensed({
  variable: '--font-condensed',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const mono = JetBrains_Mono({
  variable: '--font-mono-family',
  subsets: ['latin'],
  display: 'swap',
});

const bengali = Noto_Sans_Bengali({
  variable: '--font-bengali',
  subsets: ['bengali', 'latin'],
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'LeaveMaster — Employee Leave Management & Tracker',
  description: 'Smart personal leave tracking, balance calculations, working day calendar, official email generator, and printable leave documentation for employees.',
  keywords: ['leave management', 'employee portal', 'leave tracker', 'vacation planner', 'sick leave', 'casual leave'],
  authors: [{ name: 'Employee Portal' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${condensed.variable} ${mono.variable} ${bengali.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
