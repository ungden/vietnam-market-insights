'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';

interface HistoryPoint {
  date: string;
  buy: number;
  sell: number;
}

interface ChartDataPoint {
  date: string;
  label: string;
  buy: number;
  sell: number;
}

const TIMEFRAMES = [
  { key: '1W', label: '1 Tuần', days: 7 },
  { key: '1M', label: '1 Tháng', days: 30 },
  { key: '3M', label: '3 Tháng', days: 90 },
  { key: 'ALL', label: 'Tất cả', days: 9999 },
] as const;

export function GoldPriceChart() {
  const [rawData, setRawData] = useState<HistoryPoint[]>([]);
  const [timeframe, setTimeframe] = useState<string>('1M');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        const res = await fetch('/api/gold-history');
        if (!res.ok) throw new Error('Không thể lấy lịch sử giá vàng');
        const json = await res.json();
        setRawData(json.data || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  // Lọc data theo timeframe
  const chartData = useMemo((): ChartDataPoint[] => {
    if (rawData.length === 0) return [];

    const tf = TIMEFRAMES.find((t) => t.key === timeframe) || TIMEFRAMES[1];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - tf.days);

    const filtered = tf.key === 'ALL'
      ? rawData
      : rawData.filter((p) => new Date(p.date) >= cutoff);

    return filtered.map((p) => {
      const d = new Date(p.date);
      return {
        date: p.date,
        label: `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`,
        buy: p.buy,
        sell: p.sell,
      };
    });
  }, [rawData, timeframe]);

  // Tính biến động
  const priceChange = useMemo(() => {
    if (chartData.length < 2) return null;
    const first = chartData[0].sell;
    const last = chartData[chartData.length - 1].sell;
    const change = last - first;
    const pct = ((change / first) * 100).toFixed(2);
    return { change, pct, isUp: change >= 0 };
  }, [chartData]);

  if (loading) {
    return (
      <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        <p className="text-sm text-muted-foreground mt-3">Đang tải biểu đồ lịch sử...</p>
      </div>
    );
  }

  if (error || chartData.length === 0) {
    return (
      <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center text-center">
        <p className="text-destructive font-medium">{error || 'Chưa có dữ liệu lịch sử'}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[400px] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-bold">Biểu đồ giá vàng SJC</h3>
          <div className="flex items-center gap-2 mt-1">
            {priceChange && (
              <span className={`flex items-center gap-1 text-sm font-semibold ${priceChange.isUp ? 'text-emerald-600' : 'text-destructive'}`}>
                {priceChange.isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {priceChange.isUp ? '+' : ''}{priceChange.change.toFixed(1)}M ({priceChange.isUp ? '+' : ''}{priceChange.pct}%)
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {chartData.length} ngày dữ liệu
            </span>
          </div>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.key}
              onClick={() => setTimeframe(tf.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                timeframe === tf.key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id="gradBuy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradSell" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
              dy={10}
              interval={Math.max(0, Math.floor(chartData.length / 8))}
            />
            <YAxis
              domain={['dataMin - 2', 'dataMax + 2']}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              tickFormatter={(val: number) => `${val}M`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--card)',
                color: 'var(--foreground)',
                fontSize: '13px',
              }}
              labelFormatter={(label) => `Ngày ${label}`}
              formatter={(value) => [
                `${Number(value).toFixed(1)} triệu`,
                '',
              ]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value: string) => (
                <span className="text-sm font-medium text-foreground ml-1">{value}</span>
              )}
            />
            <Area
              name="Mua vào"
              type="monotone"
              dataKey="buy"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#gradBuy)"
              dot={chartData.length <= 30}
              activeDot={{ r: 5 }}
            />
            <Area
              name="Bán ra"
              type="monotone"
              dataKey="sell"
              stroke="#16a34a"
              strokeWidth={2}
              fill="url(#gradSell)"
              dot={chartData.length <= 30}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
