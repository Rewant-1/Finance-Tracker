
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/Providers';
import { DarkModeToggle } from '@/components/DarkModeToggle';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Couple Finance Tracker',
  description: 'A cute, animated, mobile-first finance tracker for couples',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className + " min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 dark:from-[#18122B] dark:via-[#393053] dark:to-[#443C68] transition-colors duration-500 relative overflow-x-hidden"}>
        <Providers>
          {/* Animated background hearts */}
          <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
            <svg width="100%" height="100%" className="absolute left-0 top-0 w-full h-full animate-pulse opacity-20">
              <g>
                <circle cx="20%" cy="30%" r="60" fill="#f472b6" />
                <circle cx="80%" cy="60%" r="80" fill="#a78bfa" />
                <circle cx="50%" cy="80%" r="40" fill="#38bdf8" />
                <circle cx="70%" cy="20%" r="30" fill="#fbbf24" />
                <circle cx="10%" cy="70%" r="50" fill="#f472b6" />
              </g>
            </svg>
          </div>
          <main className="relative z-10">{children}</main>
          {/* Floating dark mode toggle */}
          <DarkModeToggle />
        </Providers>
      </body>
    </html>
  );
}
