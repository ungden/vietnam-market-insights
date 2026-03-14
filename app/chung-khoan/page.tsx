import { StockOverview } from '@/components/widgets/StockOverview';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chứng khoán Việt Nam - VN-INDEX, VN30 - VnMarket',
  description: 'Theo dõi chỉ số VN-INDEX, VN30-INDEX và tin tức chứng khoán Việt Nam cập nhật liên tục.',
};

export default function ChungKhoanPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8">
      <section className="bg-card rounded-xl border shadow-sm p-6">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-500 uppercase mb-2">
          Chứng khoán Việt Nam
        </h1>
        <p className="text-sm text-muted-foreground italic mb-6">
          Cập nhật chỉ số VN-INDEX, VN30 theo phiên giao dịch
        </p>
        <StockOverview />
      </section>
    </div>
  );
}
