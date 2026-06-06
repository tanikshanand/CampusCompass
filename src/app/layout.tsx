import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'CampusCompass – Smart College Discovery & Decision Platform',
  description: 'Discover colleges, compare rankings, and predict your matching probability with our smart algorithms.',
  keywords: ['college discovery', 'college comparison', 'college predictor', 'admissions matching'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="bg-slate-950 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
