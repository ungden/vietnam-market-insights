'use client';

import { Moon, Sun, Globe, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { GoldPriceResponse } from '@/lib/types';
import type { MarketData } from '@/lib/types';
import { formatVNPrice } from '@/lib/api';

export function Header() {
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [goldData, setGoldData] = useState<GoldPriceResponse | null>(null);
  const [marketData, setMarketData] = useState<MarketData | null>(null);

  // Khôi phục dark mode từ localStorage khi component mount
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = saved === 'dark' || (!saved && prefersDark);
    // Dùng callback để tránh ESLint cảnh báo setState trong effect
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
      // Dùng queueMicrotask để tách khỏi sync effect
      queueMicrotask(() => setIsDark(true));
    }
  }, []);

  // Áp dụng dark mode và lưu vào localStorage
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Fetch dữ liệu ticker
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
        // Bỏ qua lỗi ticker
      }
    }
    fetchTicker();
  }, []);

  // Lấy giá SJC đầu tiên cho ticker
  const sjcPrice = goldData?.prices?.find((p) => p.brand.includes('SJC'));
  const btmhPrice = goldData?.prices?.find((p) => p.brand.includes('Bảo Tín Mạnh Hải') || p.brand.includes('BTMH'));
  const usdRate = marketData?.exchangeRates?.find((r) => r.currency === 'USD');
  const eurRate = marketData?.exchangeRates?.find((r) => r.currency === 'EUR');
  const vnIndex = marketData?.stockIndices?.find((s) => s.name === 'VN-INDEX');
  const vn30 = marketData?.stockIndices?.find((s) => s.name === 'VN30');

  const mainNavLinks = [
    { label: 'Tin tức', href: '#tin-tuc' },
    { label: 'Kinh doanh', href: '#gia-vang' },
    { label: 'Thế giới', href: '#' },
    { label: 'Thể thao', href: '#' },
    { label: 'Giải trí', href: '#' },
    { label: 'Sức khỏe', href: '#' },
  ];

  const subNavLinks = [
    { label: 'KINH DOANH', href: '#gia-vang', active: true },
    { label: 'Kinh tế thế giới', href: '#' },
    { label: 'Bất động sản', href: '#' },
    { label: 'Ngân hàng', href: '#' },
    { label: 'Tỷ giá', href: '#' },
    { label: 'Giá vàng', href: '#gia-vang', highlight: true },
  ];

  return (
    <header className="w-full border-b bg-background sticky top-0 z-50">
      {/* Thanh điều hướng chính - Nền xanh */}
      <div className="bg-[#7fb341] text-white">
        <div className="mx-auto flex h-10 max-w-7xl items-center px-4 sm:px-6">
          <button
            className="mr-4 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <nav className="hidden md:flex items-center gap-6 text-sm font-bold uppercase tracking-wide">
            {mainNavLinks.map((link) => (
              <Link key={link.label} href={link.href} className="hover:text-white/80">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-b shadow-lg">
          <nav className="mx-auto max-w-7xl px-4 py-4 space-y-1">
            {mainNavLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="block px-4 py-3 text-sm font-medium rounded-md hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t my-2" />
            {subNavLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`block px-4 py-3 text-sm rounded-md hover:bg-muted transition-colors ${
                  link.highlight ? 'font-bold text-amber-600 dark:text-amber-500' : 'text-muted-foreground'
                } ${link.active ? 'font-bold text-foreground' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Thanh phụ */}
      <div className="border-b">
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6 text-sm">
          <div className="flex items-center gap-6 font-medium">
            <Link href="/" className="font-bold text-lg">
              <Globe className="h-5 w-5 inline-block mr-1 text-primary" />
              VnMarket
            </Link>
            <nav className="hidden lg:flex items-center gap-4 text-muted-foreground">
              {subNavLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`hover:text-foreground ${
                    link.active ? 'font-bold text-foreground' : ''
                  } ${link.highlight ? 'font-bold text-amber-600 dark:text-amber-500' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <button
            onClick={() => setIsDark(!isDark)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent"
            aria-label={isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Ô tóm tắt thị trường */}
      <div className="bg-muted/30 border-b">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 overflow-x-auto no-scrollbar">
          {/* Ô 1: Giá vàng */}
          <div className="flex min-w-[280px] items-center gap-4 rounded-md border bg-background p-3 shadow-sm">
            <div className="flex flex-col items-center justify-center border-r pr-4">
              <span className="font-bold text-amber-600 dark:text-amber-500">GIÁ VÀNG</span>
              <span className="text-[10px] text-muted-foreground font-medium">SJC</span>
            </div>
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-8 font-medium">SJC</span>
                <span className="text-muted-foreground text-xs">Mua</span>
                <span className="font-bold">{sjcPrice ? formatVNPrice(sjcPrice.buy) : '---'}</span>
                <span className="text-muted-foreground text-xs">Bán</span>
                <span className="font-bold">{sjcPrice ? formatVNPrice(sjcPrice.sell) : '---'}</span>
              </div>
              {btmhPrice && (
                <div className="flex items-center gap-2">
                  <span className="w-8 font-medium text-xs">BTMH</span>
                  <span className="text-muted-foreground text-xs">Mua</span>
                  <span className="font-bold">{formatVNPrice(btmhPrice.buy)}</span>
                  <span className="text-muted-foreground text-xs">Bán</span>
                  <span className="font-bold">{formatVNPrice(btmhPrice.sell)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Ô 2: Tỷ giá */}
          <div className="flex min-w-[280px] items-center gap-4 rounded-md border bg-background p-3 shadow-sm">
            <div className="flex flex-col items-center justify-center border-r pr-4">
              <span className="font-bold text-emerald-600 dark:text-emerald-500">TỶ GIÁ</span>
            </div>
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-8 font-medium">USD</span>
                <span className="text-muted-foreground text-xs">Mua</span>
                <span className="font-bold">{usdRate ? formatVNPrice(usdRate.buy) : '---'}</span>
                <span className="text-muted-foreground text-xs">Bán</span>
                <span className="font-bold">{usdRate ? formatVNPrice(usdRate.sell) : '---'}</span>
              </div>
              {eurRate && (
                <div className="flex items-center gap-2">
                  <span className="w-8 font-medium">EUR</span>
                  <span className="text-muted-foreground text-xs">Mua</span>
                  <span className="font-bold">{formatVNPrice(eurRate.buy)}</span>
                  <span className="text-muted-foreground text-xs">Bán</span>
                  <span className="font-bold">{formatVNPrice(eurRate.sell)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Ô 3: Chứng khoán */}
          <div className="flex min-w-[280px] items-center gap-4 rounded-md border bg-background p-3 shadow-sm">
            <div className="flex flex-col items-center justify-center border-r pr-4">
              <span className="font-bold text-blue-600 dark:text-blue-500">
                CHỨNG
                <br />
                KHOÁN
              </span>
            </div>
            <div className="flex flex-col gap-1 text-sm">
              {vnIndex && (
                <div className="flex items-center gap-2">
                  <span className="w-20 font-medium">VN-INDEX</span>
                  <span className="font-bold">{vnIndex.value.toFixed(2)}</span>
                  <span
                    className={`text-xs flex items-center font-medium ${
                      vnIndex.change >= 0 ? 'text-emerald-600' : 'text-destructive'
                    }`}
                  >
                    {vnIndex.change >= 0 ? '▲' : '▼'} {Math.abs(vnIndex.change).toFixed(2)} (
                    {Math.abs(vnIndex.changePercent).toFixed(2)}%)
                  </span>
                </div>
              )}
              {vn30 && (
                <div className="flex items-center gap-2">
                  <span className="w-20 font-medium">VN30</span>
                  <span className="font-bold">{vn30.value.toFixed(1)}</span>
                  <span
                    className={`text-xs flex items-center font-medium ${
                      vn30.change >= 0 ? 'text-emerald-600' : 'text-destructive'
                    }`}
                  >
                    {vn30.change >= 0 ? '▲' : '▼'} {Math.abs(vn30.change).toFixed(1)} (
                    {Math.abs(vn30.changePercent).toFixed(2)}%)
                  </span>
                </div>
              )}
              {!vnIndex && !vn30 && (
                <span className="text-muted-foreground text-xs">Đang tải...</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
