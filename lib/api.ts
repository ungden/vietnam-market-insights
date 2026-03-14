import type {
  GoldPriceResponse,
  NewsResponse,
  MarketData,
  ApiResponse,
} from './types';

const BASE_URL = typeof window !== 'undefined' ? '' : (process.env.APP_URL || 'http://localhost:3000');

/**
 * Hàm fetch chung với xử lý lỗi
 */
async function fetchApi<T>(endpoint: string, revalidate?: number): Promise<ApiResponse<T>> {
  try {
    const url = `${BASE_URL}${endpoint}`;
    const res = await fetch(url, {
      next: { revalidate: revalidate ?? 300 }, // Cache 5 phút mặc định
    });

    if (!res.ok) {
      throw new Error(`Lỗi HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lỗi không xác định';
    console.error(`[API] Lỗi khi gọi ${endpoint}:`, message);
    return { success: false, error: message };
  }
}

/**
 * Lấy giá vàng trong nước
 */
export async function getGoldPrices(): Promise<ApiResponse<GoldPriceResponse>> {
  return fetchApi<GoldPriceResponse>('/api/gold-prices', 180); // Cache 3 phút
}

/**
 * Lấy tin tức từ RSS feeds
 */
export async function getNews(): Promise<ApiResponse<NewsResponse>> {
  return fetchApi<NewsResponse>('/api/news', 600); // Cache 10 phút
}

/**
 * Lấy dữ liệu thị trường (tỷ giá, chứng khoán)
 */
export async function getMarketData(): Promise<ApiResponse<MarketData>> {
  return fetchApi<MarketData>('/api/market', 300); // Cache 5 phút
}

/**
 * Format số với dấu chấm phân cách nghìn (kiểu Việt Nam)
 * VD: 179600 -> "179.600"
 */
export function formatVNPrice(value: number): string {
  return value.toLocaleString('vi-VN');
}

/**
 * Format thời gian tương đối (kiểu "5 phút trước", "2 giờ trước")
 */
export function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Format ngày giờ hiện tại theo kiểu Việt Nam
 * VD: "05:06 (15/03/2026)"
 */
export function formatVNDateTime(date?: Date): string {
  const d = date || new Date();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();

  return `${hours}:${minutes} (${day}/${month}/${year})`;
}

/**
 * Format ngày theo kiểu dd/MM/yyyy
 */
export function formatVNDate(date?: Date): string {
  const d = date || new Date();
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}
