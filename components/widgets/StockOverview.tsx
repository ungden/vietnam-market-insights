'use client';

import { useState, useEffect } from 'react';
import { Loader2, TrendingUp, TrendingDown, BarChart3, Activity } from 'lucide-react';
import type { MarketData, StockIndex } from '@/lib/types';

export function StockOverview() {
  const [indices, setIndices] = useState<StockIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch('/api/market');
        if (!res.ok) throw new Error('Không thể lấy dữ liệu');
        const data: MarketData = await res.json();
        setIndices(data.stockIndices || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-sm text-muted-foreground mt-3">Đang tải dữ liệu chứng khoán...</p>
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
    <div className="space-y-6">
      {/* Các chỉ số chính */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {indices.map((idx) => {
          const isUp = idx.change >= 0;
          return (
            <div key={idx.name} className="rounded-xl border bg-background p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2.5 ${isUp ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                    <BarChart3 className={`h-5 w-5 ${isUp ? 'text-emerald-600' : 'text-destructive'}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{idx.name}</h3>
                    <p className="text-xs text-muted-foreground">Sàn HOSE</p>
                  </div>
                </div>
                {isUp ? (
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-destructive" />
                )}
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold">{idx.value.toFixed(2)}</p>
                  <p className={`text-sm font-semibold mt-1 ${isUp ? 'text-emerald-600' : 'text-destructive'}`}>
                    {isUp ? '▲' : '▼'} {Math.abs(idx.change).toFixed(2)} ({isUp ? '+' : ''}{idx.changePercent.toFixed(2)}%)
                  </p>
                </div>
                <div className="text-right">
                  <Activity className="h-12 w-12 text-muted-foreground/20" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Thông tin thêm */}
      <div className="rounded-xl border bg-muted/30 p-6">
        <h3 className="font-bold mb-3">Thông tin thị trường</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Phiên giao dịch</p>
            <p className="font-semibold">Sáng: 9:00 - 11:30</p>
            <p className="font-semibold">Chiều: 13:00 - 15:00</p>
          </div>
          <div>
            <p className="text-muted-foreground">Sàn giao dịch</p>
            <p className="font-semibold">HOSE (TP.HCM)</p>
            <p className="font-semibold">HNX (Hà Nội)</p>
          </div>
          <div>
            <p className="text-muted-foreground">Nguồn dữ liệu</p>
            <p className="font-semibold">CafeF, SSI</p>
            <p className="text-xs text-muted-foreground mt-1">Cập nhật theo phiên</p>
          </div>
        </div>
      </div>
    </div>
  );
}
