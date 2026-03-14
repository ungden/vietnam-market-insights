'use client';

import { ArrowDownRight, ArrowUpRight, Coins, Banknote, BarChart3, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { GoldPriceResponse, MarketData } from '@/lib/types';
import { formatVNPrice } from '@/lib/api';

interface MarketStat {
  name: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: typeof Coins;
}

export function MarketOverviewWidget() {
  const [stats, setStats] = useState<MarketStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [goldRes, marketRes] = await Promise.all([
          fetch('/api/gold-prices'),
          fetch('/api/market'),
        ]);

        const items: MarketStat[] = [];

        if (goldRes.ok) {
          const goldData: GoldPriceResponse = await goldRes.json();
          const sjc = goldData.prices?.find((p) => p.brand.includes('SJC'));
          if (sjc) {
            items.push({
              name: 'Vàng SJC (Bán)',
              value: `${formatVNPrice(sjc.sell)} đ/lượng`,
              change: `Mua: ${formatVNPrice(sjc.buy)}`,
              changeType: 'neutral',
              icon: Coins,
            });
          }
        }

        if (marketRes.ok) {
          const market: MarketData = await marketRes.json();

          const usd = market.exchangeRates?.find((r) => r.currency === 'USD');
          if (usd) {
            items.push({
              name: 'USD/VND',
              value: `${formatVNPrice(usd.sell)} đ`,
              change: `Mua: ${formatVNPrice(usd.buy)}`,
              changeType: 'neutral',
              icon: Banknote,
            });
          }

          const vnIndex = market.stockIndices?.find((s) => s.name === 'VN-INDEX');
          if (vnIndex) {
            items.push({
              name: 'VN-INDEX',
              value: vnIndex.value.toFixed(2),
              change: `${vnIndex.change >= 0 ? '+' : ''}${vnIndex.change.toFixed(2)} (${vnIndex.changePercent >= 0 ? '+' : ''}${vnIndex.changePercent.toFixed(2)}%)`,
              changeType: vnIndex.change >= 0 ? 'positive' : 'negative',
              icon: BarChart3,
            });
          }

          const vn30 = market.stockIndices?.find((s) => s.name === 'VN30');
          if (vn30) {
            items.push({
              name: 'VN30',
              value: vn30.value.toFixed(2),
              change: `${vn30.change >= 0 ? '+' : ''}${vn30.change.toFixed(2)} (${vn30.changePercent >= 0 ? '+' : ''}${vn30.changePercent.toFixed(2)}%)`,
              changeType: vn30.change >= 0 ? 'positive' : 'negative',
              icon: BarChart3,
            });
          }
        }

        setStats(items);
      } catch {
        // Giữ danh sách trống
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold tracking-tight font-serif">Tổng quan thị trường</h2>
        <span className="text-xs text-muted-foreground">Cập nhật liên tục</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : stats.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">Chưa có dữ liệu</p>
      ) : (
        <div className="flex flex-col gap-3">
          {stats.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-lg border bg-background p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-primary/10 p-2">
                  <item.icon className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{item.name}</p>
                  <p className="font-semibold text-foreground">{item.value}</p>
                </div>
              </div>
              <div
                className={`text-right text-sm font-semibold ${
                  item.changeType === 'positive'
                    ? 'text-emerald-600 dark:text-emerald-500'
                    : item.changeType === 'negative'
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                }`}
              >
                <div className="flex items-center justify-end">
                  {item.changeType === 'positive' && <ArrowUpRight className="h-3 w-3 mr-1" />}
                  {item.changeType === 'negative' && <ArrowDownRight className="h-3 w-3 mr-1" />}
                  {item.change}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
