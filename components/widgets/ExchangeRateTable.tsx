'use client';

import { useState, useEffect } from 'react';
import { Loader2, ArrowUpDown } from 'lucide-react';
import type { MarketData, ExchangeRate } from '@/lib/types';
import { formatVNPrice } from '@/lib/api';

// Thông tin tiền tệ
const currencyInfo: Record<string, { name: string; flag: string }> = {
  USD: { name: 'Đô la Mỹ', flag: '🇺🇸' },
  EUR: { name: 'Euro', flag: '🇪🇺' },
  GBP: { name: 'Bảng Anh', flag: '🇬🇧' },
  JPY: { name: 'Yên Nhật', flag: '🇯🇵' },
  CNY: { name: 'Nhân dân tệ', flag: '🇨🇳' },
  AUD: { name: 'Đô la Úc', flag: '🇦🇺' },
  CAD: { name: 'Đô la Canada', flag: '🇨🇦' },
  CHF: { name: 'Franc Thụy Sĩ', flag: '🇨🇭' },
  SGD: { name: 'Đô la Singapore', flag: '🇸🇬' },
  THB: { name: 'Baht Thái', flag: '🇹🇭' },
  KRW: { name: 'Won Hàn Quốc', flag: '🇰🇷' },
  HKD: { name: 'Đô la Hồng Kông', flag: '🇭🇰' },
  TWD: { name: 'Đô la Đài Loan', flag: '🇹🇼' },
};

export function ExchangeRateTable() {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRates() {
      try {
        setLoading(true);
        const res = await fetch('/api/market');
        if (!res.ok) throw new Error('Không thể lấy tỷ giá');
        const data: MarketData = await res.json();
        setRates(data.exchangeRates || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi');
      } finally {
        setLoading(false);
      }
    }
    fetchRates();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <p className="text-sm text-muted-foreground mt-3">Đang tải tỷ giá...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-destructive font-medium">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="w-full text-sm">
        <caption className="sr-only">Bảng tỷ giá ngoại tệ theo Vietcombank</caption>
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold border-b">Ngoại tệ</th>
            <th className="px-4 py-3 text-left font-semibold border-b">Tên</th>
            <th className="px-4 py-3 text-right font-semibold border-b">Giá mua (VND)</th>
            <th className="px-4 py-3 text-right font-semibold border-b">Giá bán (VND)</th>
            <th className="px-4 py-3 text-right font-semibold border-b">Chênh lệch</th>
          </tr>
        </thead>
        <tbody>
          {rates.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                Chưa có dữ liệu tỷ giá
              </td>
            </tr>
          ) : (
            rates.map((rate) => {
              const info = currencyInfo[rate.currency];
              const spread = rate.sell - rate.buy;
              return (
                <tr key={rate.currency} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-bold">
                    <span className="mr-2">{info?.flag || '💱'}</span>
                    {rate.currency}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {info?.name || rate.currency}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatVNPrice(rate.buy)}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-500">
                    {formatVNPrice(rate.sell)}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {formatVNPrice(spread)}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
