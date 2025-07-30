// src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter, Crimson_Text } from 'next/font/google';
import { initializeBackupSystem } from '@/lib/init';

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap',
});

const crimsonText = Crimson_Text({ 
  weight: ['400', '600', '700'],
  subsets: ['latin'], 
  variable: '--font-crimson',
  style: ['normal', 'italic'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "घर नारी",
  description: 'जहाँ कहानियाँ जिंदगी बन जाती हैं',
};

// Initialize backup system
initializeBackupSystem();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${crimsonText.variable}`}>
      <body className="font-sans antialiased relative">
        {/* Global Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-warm-cream/90"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
