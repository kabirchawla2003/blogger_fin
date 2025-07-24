import './globals.css';
import type { Metadata } from 'next';
import { Inter, Crimson_Text } from 'next/font/google';

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
  title: "Author's Corner",
  description: 'Where stories come to life',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${crimsonText.variable}`}>
      <body className="bg-warm-cream text-earth-green-800 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
