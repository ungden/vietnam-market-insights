'use client';

import { ArrowRightLeft, Calculator } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { GoldPriceResponse } from '@/lib/types';
import { formatVNPrice } from '@/lib/api';

export function ConverterTool() {
  const [amount, setAmount] = useState('1');
  const [fromUnit, setFromUnit] = useState('luong');
  const [toUnit, setToUnit] = useState('chi');
  const [sjcSellPrice, setSjcSellPrice] = useState<number>(182600); // Mặc định

  // Lấy giá SJC thật để tính chênh lệch
  useEffect(() => {
    async function fetchPrice() {
      try {
        const res = await fetch('/api/gold-prices');
        if (res.ok) {
          const data: GoldPriceResponse = await res.json();
          const sjc = data.prices?.find((p) => p.brand.includes('SJC'));
          if (sjc) setSjcSellPrice(sjc.sell);
        }
      } catch {
        // Giữ giá mặc định
      }
    }
    fetchPrice();
  }, []);

  const convert = (): string => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return '0';

    // Bảng quy đổi khối lượng vàng (đơn vị: lượng)
    const toTael: Record<string, number> = {
      luong: 1,
      chi: 0.1,
      ounce: 0.8294, // 1 ounce = 0.8294 lượng (xấp xỉ)
      gram: 0.02667, // 1 gram = 1/37.5 lượng
    };

    // Quy đổi tiền tệ
    if (fromUnit === 'usd' && toUnit === 'vnd') {
      return (val * 25400).toLocaleString('vi-VN');
    }
    if (fromUnit === 'vnd' && toUnit === 'usd') {
      return (val / 25400).toFixed(2);
    }

    // Quy đổi khối lượng vàng
    const fromFactor = toTael[fromUnit];
    const toFactor = toTael[toUnit];

    if (fromFactor !== undefined && toFactor !== undefined) {
      const taelValue = val * fromFactor;
      const result = taelValue / toFactor;
      return result % 1 === 0 ? result.toString() : result.toFixed(4);
    }

    return val.toString();
  };

  // Tính giá vàng thế giới quy đổi
  // Giả sử giá vàng thế giới ~ 2350 USD/ounce
  const worldGoldPriceUSD = 5000; // USD/ounce (xấp xỉ)
  const worldGoldPriceVND = Math.round((worldGoldPriceUSD * 25400) / 0.8294 / 1000) * 1000;
  const sjcPriceVND = sjcSellPrice * 1000; // Chuyển từ nghìn đồng sang đồng
  const priceDiff = sjcPriceVND - worldGoldPriceVND;

  const unitOptions = [
    { value: 'luong', label: 'Lượng' },
    { value: 'chi', label: 'Chỉ' },
    { value: 'ounce', label: 'Ounce' },
    { value: 'gram', label: 'Gram' },
    { value: 'usd', label: 'USD' },
    { value: 'vnd', label: 'VND' },
  ];

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold tracking-tight font-serif">Công cụ Quy đổi</h2>
          <p className="text-sm text-muted-foreground">Vàng & Ngoại tệ</p>
        </div>
        <Calculator className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex-1 space-y-2">
            <label htmlFor="converter-amount" className="text-sm font-medium text-foreground">
              Số lượng
            </label>
            <input
              type="number"
              id="converter-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Nhập số lượng..."
              min="0"
            />
          </div>
          <div className="flex-1 space-y-2">
            <label htmlFor="converter-from" className="text-sm font-medium text-foreground">
              Từ
            </label>
            <select
              id="converter-from"
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {unitOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => {
              const temp = fromUnit;
              setFromUnit(toUnit);
              setToUnit(temp);
            }}
            className="rounded-full bg-muted p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label="Đảo ngược đơn vị quy đổi"
          >
            <ArrowRightLeft className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex-1 space-y-2">
            <label htmlFor="converter-to" className="text-sm font-medium text-foreground">
              Sang
            </label>
            <select
              id="converter-to"
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {unitOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-foreground">Kết quả</label>
            <div className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-semibold text-foreground">
              {convert()}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-md bg-primary/5 p-4 border border-primary/10">
        <h3 className="text-sm font-semibold text-primary mb-2">Chênh lệch giá vàng trong nước - thế giới</h3>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Giá thế giới quy đổi (ước tính):</span>
          <span className="font-medium">{(worldGoldPriceVND / 1000).toLocaleString('vi-VN')} nghìn đ/lượng</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-muted-foreground">Giá SJC trong nước (bán):</span>
          <span className="font-medium">{formatVNPrice(sjcSellPrice)} nghìn đ/lượng</span>
        </div>
        <div className="flex justify-between text-sm mt-2 pt-2 border-t border-primary/10">
          <span className="font-semibold text-foreground">Chênh lệch:</span>
          <span className={`font-bold ${priceDiff > 0 ? 'text-destructive' : 'text-emerald-600'}`}>
            {priceDiff > 0 ? '+' : ''}{(priceDiff / 1000).toLocaleString('vi-VN')} nghìn đ/lượng
          </span>
        </div>
      </div>
    </div>
  );
}
