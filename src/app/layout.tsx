import type { Metadata, Viewport } from 'next';
import './globals.css';

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
    <html lang="en" data-theme="dark">
      <body>
        {children}
      </body>
    </html>
  );
}
