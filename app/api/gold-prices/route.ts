import { NextResponse } from 'next/server';
import type { GoldPrice, GoldPriceResponse } from '@/lib/types';

/**
 * API lấy giá vàng trong nước từ giavang.org
 * Nguồn: https://giavang.org/trong-nuoc/
 * Parse HTML table để lấy giá mua/bán theo thương hiệu và khu vực
 */

// Cache giá vàng trong bộ nhớ (tránh gọi quá nhiều)
let cachedData: GoldPriceResponse | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 3 * 60 * 1000; // 3 phút

/**
 * Parse HTML từ giavang.org để lấy bảng giá vàng SJC
 */
function parseGoldPrices(html: string): GoldPrice[] {
  const prices: GoldPrice[] = [];
  // Tìm tất cả các hàng trong bảng giá vàng
  // Format: <tr><th>Khu vực</th><td>Thương hiệu</td><td>Giá mua</td><td>Giá bán</td></tr>
  
  const rowRegex = /<tr>(?:<th[^>]*>(?:<a[^>]*>)?([^<]+)(?:<\/a>)?<\/th>)?<td>(?:<a[^>]*>)?<strong>([^<]+)<\/strong>(?:<\/a>)?<\/td><td[^>]*>([0-9.,]+)<\/td><td[^>]*>([0-9.,]+)<\/td><\/tr>/g;
  
  let currentRegion = '';
  let match;

  while ((match = rowRegex.exec(html)) !== null) {
    const region = match[1]?.trim() || currentRegion;
    if (match[1]) {
      currentRegion = region;
    }
    
    const brand = match[2].trim();
    const buyStr = match[3].replace(/\./g, '').replace(',', '.');
    const sellStr = match[4].replace(/\./g, '').replace(',', '.');
    
    const buy = parseFloat(buyStr);
    const sell = parseFloat(sellStr);

    if (!isNaN(buy) && !isNaN(sell)) {
      prices.push({ brand, region, buy, sell });
    }
  }

  return prices;
}

/**
 * Lọc và gom nhóm giá vàng theo thương hiệu chính
 * Ưu tiên các thương hiệu lớn: SJC, PNJ, DOJI, Bảo Tín Minh Châu, Bảo Tín Mạnh Hải, Phú Quý, Mi Hồng
 */
function getMainBrands(allPrices: GoldPrice[]): GoldPrice[] {
  const brandConfig = [
    { keyword: 'SJC', region: 'TP. Hồ Chí Minh', displayName: 'SJC (HCM)' },
    { keyword: 'SJC', region: 'Hà Nội', displayName: 'SJC (HN)' },
    { keyword: 'PNJ', region: 'TP. Hồ Chí Minh', displayName: 'PNJ (HCM)' },
    { keyword: 'DOJI', region: 'TP. Hồ Chí Minh', displayName: 'DOJI (HCM)' },
    { keyword: 'DOJI', region: 'Hà Nội', displayName: 'DOJI (HN)' },
    { keyword: 'Bảo Tín Minh Châu', region: 'Hà Nội', displayName: 'Bảo Tín Minh Châu' },
    { keyword: 'Bảo Tín Mạnh Hải', region: 'Hà Nội', displayName: 'Bảo Tín Mạnh Hải' },
    { keyword: 'Phú Quý', region: 'Hà Nội', displayName: 'Phú Quý' },
    { keyword: 'Mi Hồng', region: 'TP. Hồ Chí Minh', displayName: 'Mi Hồng (HCM)' },
  ];

  const result: GoldPrice[] = [];

  for (const config of brandConfig) {
    const found = allPrices.find(
      (p) =>
        p.brand.includes(config.keyword) &&
        p.region.includes(config.region)
    );
    if (found) {
      result.push({
        brand: config.displayName,
        region: found.region,
        buy: found.buy,
        sell: found.sell,
      });
    }
  }

  // Nếu không tìm được đủ, lấy tất cả unique brands
  if (result.length === 0) {
    const seen = new Set<string>();
    for (const p of allPrices) {
      if (!seen.has(p.brand)) {
        seen.add(p.brand);
        result.push(p);
        if (result.length >= 9) break;
      }
    }
  }

  return result;
}

/**
 * Tìm thời gian cập nhật từ HTML
 */
function parseUpdateTime(html: string): string {
  // Tìm pattern: "Cập nhật lúc HH:MM:SS dd/MM/yyyy"
  const timeMatch = html.match(/Cập nhật lúc\s+(\d{1,2}:\d{2}:\d{2})\s+(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (timeMatch) {
    const [, time, day, month, year] = timeMatch;
    return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${time}+07:00`).toISOString();
  }
  return new Date().toISOString();
}

async function fetchGoldPrices(): Promise<GoldPriceResponse> {
  const now = Date.now();
  if (cachedData && now - lastFetchTime < CACHE_DURATION) {
    return cachedData;
  }

  const res = await fetch('https://giavang.org/trong-nuoc/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
    },
    next: { revalidate: 180 },
  });

  if (!res.ok) {
    throw new Error(`Không thể kết nối giavang.org: ${res.status}`);
  }

  const html = await res.text();
  const allPrices = parseGoldPrices(html);
  const mainBrands = getMainBrands(allPrices);
  const updatedAt = parseUpdateTime(html);

  const data: GoldPriceResponse = {
    prices: mainBrands.length > 0 ? mainBrands : allPrices.slice(0, 9),
    updatedAt,
    source: 'giavang.org',
  };

  cachedData = data;
  lastFetchTime = now;

  return data;
}

export async function GET() {
  try {
    const data = await fetchGoldPrices();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('[API/gold-prices] Lỗi:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể lấy dữ liệu giá vàng. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}
