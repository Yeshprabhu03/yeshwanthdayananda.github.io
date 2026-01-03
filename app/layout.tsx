import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Student Loan Calculator | International Students',
  description:
    'Plan tuition, living expenses, grace period, and repayment schedules with a responsive Student Loan Calculator built for international students.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-transparent text-slate-100">
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          {children}
        </div>
      </body>
    </html>
  );
}
