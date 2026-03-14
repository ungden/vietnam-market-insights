import { FullNewsFeed } from '@/components/widgets/FullNewsFeed';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tin tức kinh tế Việt Nam - VnMarket',
  description: 'Tổng hợp tin tức kinh tế, tài chính, giá vàng, chứng khoán mới nhất từ VnExpress và Tuổi Trẻ.',
};

export default function TinTucPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8">
      <section>
        <h1 className="text-3xl font-bold uppercase mb-2">Tin tức kinh tế</h1>
        <p className="text-sm text-muted-foreground italic mb-6">
          Tổng hợp từ VnExpress, Tuổi Trẻ - Cập nhật liên tục qua RSS
        </p>
        <FullNewsFeed />
      </section>
    </div>
  );
}
