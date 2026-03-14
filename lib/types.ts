// ===== Giá vàng =====
export interface GoldPrice {
  /** Tên thương hiệu (VD: SJC, PNJ, DOJI...) */
  brand: string;
  /** Khu vực (VD: TP. Hồ Chí Minh, Hà Nội...) */
  region: string;
  /** Giá mua vào (nghìn đồng/lượng) */
  buy: number;
  /** Giá bán ra (nghìn đồng/lượng) */
  sell: number;
}

export interface GoldPriceResponse {
  /** Danh sách giá vàng theo thương hiệu */
  prices: GoldPrice[];
  /** Thời gian cập nhật (ISO string) */
  updatedAt: string;
  /** Nguồn dữ liệu */
  source: string;
}

// ===== Biểu đồ giá vàng =====
export interface GoldChartPoint {
  /** Ngày (dd/MM) */
  date: string;
  /** Giá mua (triệu đồng) */
  buy: number;
  /** Giá bán (triệu đồng) */
  sell: number;
}

// ===== Tin tức =====
export interface NewsItem {
  /** ID duy nhất */
  id: string;
  /** Tiêu đề bài viết */
  title: string;
  /** Mô tả ngắn / tóm tắt */
  description: string;
  /** Link gốc bài viết */
  url: string;
  /** URL hình ảnh đại diện */
  imageUrl: string;
  /** Nguồn báo (VnExpress, Tuổi Trẻ...) */
  source: string;
  /** Thời gian đăng (ISO string) */
  publishedAt: string;
}

export interface NewsResponse {
  /** Danh sách tin tức */
  items: NewsItem[];
  /** Thời gian cập nhật cache */
  updatedAt: string;
}

// ===== Tỷ giá =====
export interface ExchangeRate {
  /** Mã tiền tệ (USD, EUR, JPY...) */
  currency: string;
  /** Giá mua */
  buy: number;
  /** Giá bán */
  sell: number;
}

// ===== Chứng khoán =====
export interface StockIndex {
  /** Tên chỉ số (VN-INDEX, VN30-INDEX...) */
  name: string;
  /** Giá trị hiện tại */
  value: number;
  /** Thay đổi (điểm) */
  change: number;
  /** Thay đổi (%) */
  changePercent: number;
}

// ===== Tổng hợp thị trường =====
export interface MarketData {
  exchangeRates: ExchangeRate[];
  stockIndices: StockIndex[];
  updatedAt: string;
}

// ===== API Response chung =====
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
