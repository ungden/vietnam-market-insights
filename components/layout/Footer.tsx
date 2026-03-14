'use client';

import { Globe } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30 mt-12">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cột 1: Thông tin */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Globe className="h-5 w-5 text-primary" />
              <span className="font-bold text-lg">VnMarket</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Cập nhật giá vàng SJC, PNJ, DOJI và tin tức kinh tế Việt Nam theo thời gian thực.
              Dữ liệu được tổng hợp từ các nguồn uy tín.
            </p>
          </div>

          {/* Cột 2: Nguồn dữ liệu */}
          <div>
            <h3 className="font-semibold mb-3">Nguồn dữ liệu</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="https://giavang.org" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                  giavang.org - Giá vàng trong nước
                </a>
              </li>
              <li>
                <a href="https://vnexpress.net" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                  VnExpress - Tin tức kinh doanh
                </a>
              </li>
              <li>
                <a href="https://tuoitre.vn" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                  Tuổi Trẻ Online - Tin tức kinh tế
                </a>
              </li>
              <li>
                <a href="https://vietcombank.com.vn" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                  Vietcombank - Tỷ giá ngoại tệ
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 3: Liên kết */}
          <div>
            <h3 className="font-semibold mb-3">Danh mục</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#gia-vang" className="hover:text-foreground transition-colors">
                  Giá vàng hôm nay
                </a>
              </li>
              <li>
                <a href="#tin-tuc" className="hover:text-foreground transition-colors">
                  Tin tức kinh tế
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bản quyền */}
        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} VnMarket. Dữ liệu mang tính chất tham khảo, không phải khuyến nghị đầu tư.</p>
        </div>
      </div>
    </footer>
  );
}
