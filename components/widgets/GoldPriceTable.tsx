'use client';

import { Search, Calendar, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import type { GoldPrice, GoldPriceResponse } from '@/lib/types';
import { formatVNPrice, formatVNDate } from '@/lib/api';

export function GoldPriceTable() {
  const [data, setData] = useState<GoldPriceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Lấy ngày hiện tại để hiển thị
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch('/api/gold-prices');
        if (!res.ok) throw new Error('Không thể lấy dữ liệu giá vàng');
        const json: GoldPriceResponse = await res.json();
        setData(json);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Lọc theo từ khóa tìm kiếm
  const filteredPrices = useMemo(() => {
    if (!data?.prices) return [];
    if (!searchQuery.trim()) return data.prices;
    const query = searchQuery.toLowerCase();
    return data.prices.filter(
      (p) =>
        p.brand.toLowerCase().includes(query) ||
        p.region.toLowerCase().includes(query)
    );
  }, [data?.prices, searchQuery]);

  if (loading) {
    return (
      <div className="w-full flex flex-col h-full items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        <p className="text-sm text-muted-foreground mt-3">Đang tải giá vàng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex flex-col h-full items-center justify-center min-h-[300px] text-center">
        <p className="text-destructive font-medium">Không thể tải giá vàng</p>
        <p className="text-sm text-muted-foreground mt-1">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col h-full">
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm thương hiệu vàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-background"
            aria-label="Tìm kiếm thương hiệu vàng"
          />
        </div>
        <div className="relative flex-1">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="date"
            defaultValue={today.toISOString().split('T')[0]}
            className="w-full pl-9 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-background"
            aria-label="Chọn ngày xem giá vàng"
            readOnly
            title="Giá vàng chỉ hiển thị ngày hiện tại"
          />
        </div>
      </div>

      <div className="overflow-x-auto border rounded-md flex-1">
        <table className="w-full text-sm text-left">
          <caption className="sr-only">Bảng so sánh giá vàng trong nước hôm nay</caption>
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th rowSpan={2} className="px-4 py-3 font-medium border-b border-r align-middle">
                Thương hiệu
              </th>
              <th colSpan={2} className="px-4 py-2 font-medium text-center border-b border-r">
                Hôm nay ({formatVNDate(today)})
              </th>
            </tr>
            <tr>
              <th className="px-4 py-2 font-semibold text-foreground border-b border-r text-center">
                Giá mua
              </th>
              <th className="px-4 py-2 font-semibold text-foreground border-b text-center">
                Giá bán
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredPrices.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  {searchQuery ? 'Không tìm thấy thương hiệu phù hợp' : 'Chưa có dữ liệu'}
                </td>
              </tr>
            ) : (
              filteredPrices.map((row: GoldPrice, idx: number) => (
                <tr key={idx} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium text-foreground border-r">
                    {row.brand}
                  </td>
                  <td className="px-4 py-3 text-right border-r font-medium">
                    {formatVNPrice(row.buy)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatVNPrice(row.sell)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground italic">
        <span>Đơn vị: nghìn đồng/lượng</span>
        {data?.source && <span>Nguồn: {data.source}</span>}
      </div>
    </div>
  );
}
