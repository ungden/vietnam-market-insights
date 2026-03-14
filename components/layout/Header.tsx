'use client';

import { Moon, Sun, Globe, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { GoldPriceResponse, MarketData } from '@/lib/types';
import { formatVNPrice } from '@/lib/api';

export function Header() {
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [goldData, setGoldData] = useState<GoldPriceResponse | null>(null);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const pathname = usePathname();

  // Khôi phục dark mode từ localStorage
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = saved === 'dark' || (!saved && prefersDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
      queueMicrotask(() => setIsDark(true));
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Fetch ticker data
  useEffect(() => {
    async function fetchTicker() {
      try {
        const [goldRes, marketRes] = await Promise.all([
          fetch('/api/gold-prices'),
          fetch('/api/market'),
        ]);
        if (goldRes.ok) setGoldData(await goldRes.json());
        if (marketRes.ok) setMarketData(await marketRes.json());
      } catch {
        // Bỏ qua
      }
    }
    fetchTicker();
  }, []);

  // Đóng mobile menu khi chuyển trang
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const sjcPrice = goldData?.prices?.find((p) => p.brand.includes('SJC'));
  const usdRate = marketData?.exchangeRates?.find((r) => r.currency === 'USD');
  const eurRate = marketData?.exchangeRates?.find((r) => r.currency === 'EUR');
  const vnIndex = marketData?.stockIndices?.find((s) => s.name === 'VN-INDEX');
  const vn30 = marketData?.stockIndices?.find((s) => s.name === 'VN30');

  // Navigation chỉ tập trung tài chính
  const navLinks = [
    { label: 'Giá vàng', href: '/' },
    { label: 'Tỷ giá', href: '/ty-gia' },
    { label: 'Chứng khoán', href: '/chung-khoan' },
    { label: 'Tin tức', href: '/tin-tuc' },
  ];

  return (
    <header className="w-full border-b bg-background sticky top-0 z-50">
      {/* Thanh chính - Xanh */}
      <div className="bg-[#7fb341] text-white">
        <div className="mx-auto flex h-11 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link href="/" className="font-bold text-lg flex items-center gap-1.5">
              <Globe className="h-5 w-5" />
              VnMarket
            </Link>

            <nav className="hidden md:flex items-center gap-1 ml-4">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <button
            onClick={() => setIsDark(!isDark)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/20 transition-colors"
            aria-label={isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-b shadow-lg animate-in slide-in-from-top-2">
          <nav className="mx-auto max-w-7xl px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Ticker thị trường */}
      <div className="bg-muted/30 border-b">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2.5 sm:px-6 overflow-x-auto no-scrollbar">
          {/* Vàng */}
          <div className="flex min-w-[260px] items-center gap-3 rounded-md border bg-background p-2.5 shadow-sm">
            <div className="flex flex-col items-center justify-center border-r pr-3">
              <span className="font-bold text-amber-600 dark:text-amber-500 text-xs">VÀNG SJC</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div>
                <span className="text-muted-foreground text-xs">Mua </span>
                <span className="font-bold">{sjcPrice ? formatVNPrice(sjcPrice.buy) : '---'}</span>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Bán </span>
                <span className="font-bold">{sjcPrice ? formatVNPrice(sjcPrice.sell) : '---'}</span>
              </div>
            </div>
          </div>

          {/* Tỷ giá */}
          <div className="flex min-w-[260px] items-center gap-3 rounded-md border bg-background p-2.5 shadow-sm">
            <div className="flex flex-col items-center justify-center border-r pr-3">
              <span className="font-bold text-emerald-600 dark:text-emerald-500 text-xs">TỶ GIÁ</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div>
                <span className="text-muted-foreground text-xs">USD </span>
                <span className="font-bold">{usdRate ? formatVNPrice(usdRate.sell) : '---'}</span>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">EUR </span>
                <span className="font-bold">{eurRate ? formatVNPrice(eurRate.sell) : '---'}</span>
              </div>
            </div>
          </div>

          {/* Chứng khoán */}
          <div className="flex min-w-[280px] items-center gap-3 rounded-md border bg-background p-2.5 shadow-sm">
            <div className="flex flex-col items-center justify-center border-r pr-3">
              <span className="font-bold text-blue-600 dark:text-blue-500 text-xs">VNINDEX</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              {vnIndex ? (
                <>
                  <span className="font-bold">{vnIndex.value.toFixed(2)}</span>
                  <span className={`text-xs font-semibold ${vnIndex.change >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                    {vnIndex.change >= 0 ? '▲' : '▼'} {Math.abs(vnIndex.change).toFixed(2)} ({Math.abs(vnIndex.changePercent).toFixed(2)}%)
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground text-xs">Đang tải...</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
