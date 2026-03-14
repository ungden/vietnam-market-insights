import { NextResponse } from 'next/server';
import type { MarketData, ExchangeRate, StockIndex } from '@/lib/types';

/**
 * API lấy dữ liệu thị trường (tỷ giá, chứng khoán)
 * Nguồn: Vietcombank (tỷ giá), cafef.vn (chứng khoán)
 */

let cachedData: MarketData | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

/**
 * Lấy tỷ giá từ Vietcombank XML feed
 */
async function fetchExchangeRates(): Promise<ExchangeRate[]> {
  try {
    const res = await fetch(
      'https://portal.vietcombank.com.vn/Usercontrols/TV498/pXML.aspx?b=10',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        },
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) throw new Error(`VCB HTTP ${res.status}`);
    const xml = await res.text();

    const rates: ExchangeRate[] = [];
    const currenciesToTrack = ['USD', 'EUR', 'GBP', 'JPY', 'CNY'];

    for (const currency of currenciesToTrack) {
      const regex = new RegExp(
        `<Exrate\\s+CurrencyCode="${currency}"[^/]*Buy="([^"]*)"[^/]*Transfer="([^"]*)"[^/]*Sell="([^"]*)"`,
        'i'
      );
      const match = xml.match(regex);
      if (match) {
        const buy = parseFloat(match[1].replace(/,/g, ''));
        const sell = parseFloat(match[3].replace(/,/g, ''));
        if (!isNaN(buy) && !isNaN(sell)) {
          rates.push({ currency, buy, sell });
        }
      }
    }

    return rates;
  } catch (error) {
    console.error('[Market] Lỗi lấy tỷ giá VCB:', error);
    // Fallback data nếu không lấy được
    return [
      { currency: 'USD', buy: 26048, sell: 26318 },
      { currency: 'EUR', buy: 29391, sell: 30940 },
    ];
  }
}

/**
 * Lấy chỉ số chứng khoán
 * Parse từ cafef.vn hoặc dùng SSI API
 */
async function fetchStockIndices(): Promise<StockIndex[]> {
  try {
    const res = await fetch(
      'https://banggia.cafef.vn/stockhandler.ashx?center=1',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          'Referer': 'https://banggia.cafef.vn/',
        },
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) throw new Error(`CafeF HTTP ${res.status}`);
    const text = await res.text();

    // CafeF trả về format đặc biệt, thử parse
    const indices: StockIndex[] = [];

    // Tìm VN-INDEX
    const vnIndexMatch = text.match(/VNINDEX[|,]([0-9.]+)[|,]([0-9.-]+)[|,]([0-9.-]+)/i);
    if (vnIndexMatch) {
      indices.push({
        name: 'VN-INDEX',
        value: parseFloat(vnIndexMatch[1]),
        change: parseFloat(vnIndexMatch[2]),
        changePercent: parseFloat(vnIndexMatch[3]),
      });
    }

    // Tìm VN30
    const vn30Match = text.match(/VN30[|,]([0-9.]+)[|,]([0-9.-]+)[|,]([0-9.-]+)/i);
    if (vn30Match) {
      indices.push({
        name: 'VN30',
        value: parseFloat(vn30Match[1]),
        change: parseFloat(vn30Match[2]),
        changePercent: parseFloat(vn30Match[3]),
      });
    }

    if (indices.length > 0) return indices;

    // Fallback: Thử parse HTML từ cafef
    throw new Error('Không parse được dữ liệu từ CafeF API');
  } catch (error) {
    console.error('[Market] Lỗi lấy chỉ số CK:', error);

    // Thử nguồn khác: SSI
    try {
      const ssiRes = await fetch(
        'https://iboard-query.ssi.com.vn/v2/stock/group/index?lookupRequest.indexId=VNINDEX',
        {
          headers: {
            'User-Agent': 'Mozilla/5.0',
          },
          next: { revalidate: 300 },
        }
      );

      if (ssiRes.ok) {
        const ssiData = await ssiRes.json();
        if (ssiData?.data) {
          return [
            {
              name: 'VN-INDEX',
              value: ssiData.data.indexValue || 0,
              change: ssiData.data.change || 0,
              changePercent: ssiData.data.percentChange || 0,
            },
          ];
        }
      }
    } catch {
      // Bỏ qua
    }

    // Fallback cuối cùng
    return [
      { name: 'VN-INDEX', value: 1696.24, change: -13.37, changePercent: -0.78 },
      { name: 'VN30', value: 1853.6, change: -6.2, changePercent: -0.33 },
    ];
  }
}

async function fetchMarketData(): Promise<MarketData> {
  const now = Date.now();
  if (cachedData && now - lastFetchTime < CACHE_DURATION) {
    return cachedData;
  }

  const [exchangeRates, stockIndices] = await Promise.all([
    fetchExchangeRates(),
    fetchStockIndices(),
  ]);

  const data: MarketData = {
    exchangeRates,
    stockIndices,
    updatedAt: new Date().toISOString(),
  };

  cachedData = data;
  lastFetchTime = now;

  return data;
}

export async function GET() {
  try {
    const data = await fetchMarketData();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('[API/market] Lỗi:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể lấy dữ liệu thị trường.' },
      { status: 500 }
    );
  }
}
