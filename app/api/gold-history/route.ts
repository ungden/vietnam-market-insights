import { NextResponse } from 'next/server';

/**
 * API lấy lịch sử giá vàng SJC từ giavang.org
 * Nguồn: Highcharts data được nhúng trong trang /trong-nuoc/sjc/
 * Data bao gồm giá mua + bán theo ngày, có thể lên tới vài tháng gần nhất
 */

interface HistoryPoint {
  date: string;      // ISO date string
  buy: number;       // Triệu đồng/lượng
  sell: number;      // Triệu đồng/lượng
}

interface HistoryResponse {
  data: HistoryPoint[];
  source: string;
  updatedAt: string;
}

// Cache
let cachedData: HistoryResponse | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 phút (data lịch sử ít thay đổi)

/**
 * Parse Highcharts series data từ HTML
 * Format: seriesOptions = [{name:"Mua vào",data:[[timestamp, price], ...]}, {name:"Bán ra",data:[[timestamp, price], ...]}]
 */
function parseHighchartsData(html: string): HistoryPoint[] {
  const points: HistoryPoint[] = [];

  // Tìm mảng data mua vào
  const buyMatch = html.match(/name:"Mua vào",data:\[([\s\S]*?)\],tooltip/);
  const sellMatch = html.match(/name:"Bán ra",data:\[([\s\S]*?)\],tooltip/);

  if (!buyMatch || !sellMatch) return [];

  // Parse mảng [timestamp, price] cho buy
  const buyPairs: [number, number][] = [];
  const buyRegex = /\[(\d+),([0-9.]+)\]/g;
  let m;
  while ((m = buyRegex.exec(buyMatch[1])) !== null) {
    buyPairs.push([parseInt(m[1]), parseFloat(m[2])]);
  }

  // Parse mảng [timestamp, price] cho sell
  const sellMap = new Map<number, number>();
  const sellRegex = /\[(\d+),([0-9.]+)\]/g;
  while ((m = sellRegex.exec(sellMatch[1])) !== null) {
    sellMap.set(parseInt(m[1]), parseFloat(m[2]));
  }

  // Gộp buy + sell theo timestamp
  for (const [ts, buyPrice] of buyPairs) {
    const sellPrice = sellMap.get(ts);
    if (sellPrice !== undefined) {
      const date = new Date(ts);
      points.push({
        date: date.toISOString(),
        buy: buyPrice,
        sell: sellPrice,
      });
    }
  }

  // Sắp xếp theo thời gian
  points.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Loại bỏ trùng lặp (giữ cái cuối mỗi ngày)
  const uniqueByDay = new Map<string, HistoryPoint>();
  for (const p of points) {
    const dayKey = p.date.slice(0, 10); // yyyy-mm-dd
    uniqueByDay.set(dayKey, p); // Ghi đè, giữ cái cuối cùng trong ngày
  }

  return Array.from(uniqueByDay.values());
}

async function fetchGoldHistory(): Promise<HistoryResponse> {
  const now = Date.now();
  if (cachedData && now - lastFetchTime < CACHE_DURATION) {
    return cachedData;
  }

  const res = await fetch('https://giavang.org/trong-nuoc/sjc/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html',
    },
    next: { revalidate: 1800 },
  });

  if (!res.ok) {
    throw new Error(`Không thể kết nối giavang.org: ${res.status}`);
  }

  const html = await res.text();
  const data = parseHighchartsData(html);

  const result: HistoryResponse = {
    data,
    source: 'giavang.org',
    updatedAt: new Date().toISOString(),
  };

  cachedData = result;
  lastFetchTime = now;

  return result;
}

export async function GET() {
  try {
    const data = await fetchGoldHistory();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('[API/gold-history] Lỗi:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể lấy lịch sử giá vàng.' },
      { status: 500 }
    );
  }
}
