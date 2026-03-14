'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Loader2 } from 'lucide-react';
import type { GoldPriceResponse } from '@/lib/types';

interface ChartDataPoint {
  date: string;
  buy: number;
  sell: number;
}

/**
 * Biểu đồ giá vàng SJC
 * Hiển thị giá mua/bán hiện tại từ API thật
 */
export function GoldPriceChart() {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/gold-prices');
        if (!res.ok) throw new Error('Lỗi');
        const data: GoldPriceResponse = await res.json();

        // Tạo dữ liệu biểu đồ từ các thương hiệu
        // Mỗi thương hiệu là 1 điểm trên biểu đồ
        const points: ChartDataPoint[] = data.prices.map((p) => ({
          date: p.brand.replace(/\s*\([^)]*\)/g, ''), // Bỏ phần (HCM), (HN)
          buy: p.buy / 1000, // Chuyển sang triệu
          sell: p.sell / 1000,
        }));

        setChartData(points);
      } catch {
        // Fallback data nếu không fetch được
        setChartData([
          { date: 'SJC', buy: 179.6, sell: 182.6 },
          { date: 'PNJ', buy: 179.6, sell: 182.6 },
          { date: 'DOJI', buy: 179.6, sell: 182.6 },
          { date: 'BTMC', buy: 179.6, sell: 182.6 },
          { date: 'BTMH', buy: 179.6, sell: 182.6 },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        <p className="text-sm text-muted-foreground mt-3">Đang tải biểu đồ...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[400px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold">So sánh giá vàng theo thương hiệu</h3>
        <span className="text-sm font-medium text-muted-foreground">Nghìn đồng/lượng</span>
      </div>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
              dy={10}
              angle={-15}
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
              }}
              formatter={(value) => [`${Number(value).toLocaleString('vi-VN')} nghìn`, '']}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value: string) => (
                <span className="text-sm font-medium text-foreground ml-1">{value}</span>
              )}
            />
            <Line
              name="Mua vào"
              type="linear"
              dataKey="buy"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 4, fill: '#ef4444' }}
              activeDot={{ r: 6 }}
            />
            <Line
              name="Bán ra"
              type="linear"
              dataKey="sell"
              stroke="#16a34a"
              strokeWidth={2}
              dot={{ r: 4, fill: '#16a34a' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
