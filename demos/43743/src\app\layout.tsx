import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter, Noto_Serif_SC, Noto_Sans_SC } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
  weight: ['400', '500', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

const notoSerifSC = Noto_Serif_SC({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-serif-sc',
  weight: ['400', '500', '600', '700'],
});

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-sans-sc',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: '奇想小剧场',
  description: '为孩子讲一个只属于 TA 的故事',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#F8F4EC',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={`${fraunces.variable} ${inter.variable} ${notoSerifSC.variable} ${notoSansSC.variable}`}
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
