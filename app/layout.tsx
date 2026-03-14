import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AppLayout } from '@/components/layout/AppLayout';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'VnMarket - Giá vàng, tỷ giá & tin tức kinh tế Việt Nam',
  description:
    'Cập nhật giá vàng SJC, PNJ, DOJI, tỷ giá ngoại tệ, chỉ số VN-INDEX và tin tức kinh tế Việt Nam theo thời gian thực.',
  keywords: [
    'giá vàng hôm nay',
    'giá vàng SJC',
    'giá vàng PNJ',
    'giá vàng DOJI',
    'tỷ giá USD',
    'VN-INDEX',
    'tin tức kinh tế',
    'thị trường Việt Nam',
  ],
  authors: [{ name: 'VnMarket' }],
  openGraph: {
    title: 'VnMarket - Giá vàng & tin tức kinh tế Việt Nam',
    description: 'Cập nhật giá vàng SJC, PNJ, DOJI và tin tức kinh tế Việt Nam theo thời gian thực.',
    type: 'website',
    locale: 'vi_VN',
    siteName: 'VnMarket',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VnMarket - Giá vàng & tin tức kinh tế Việt Nam',
    description: 'Cập nhật giá vàng SJC, PNJ, DOJI và tin tức kinh tế theo thời gian thực.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Script chống flash dark mode */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-background text-foreground antialiased">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
