'use client';

import { Share2, Check } from 'lucide-react';
import { useState } from 'react';

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const shareData = {
      title: 'Giá vàng hôm nay - VnMarket',
      text: 'Xem giá vàng SJC, PNJ, DOJI cập nhật liên tục tại VnMarket',
      url: typeof window !== 'undefined' ? window.location.href : '',
    };

    try {
      // Thử dùng Web Share API (mobile)
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      // Fallback: copy link vào clipboard
      await navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Người dùng hủy share hoặc lỗi
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
      aria-label="Chia sẻ trang giá vàng"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          ĐÃ SAO CHÉP
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          CHIA SẺ
        </>
      )}
    </button>
  );
}
