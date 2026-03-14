import { ExchangeRateTable } from '@/components/widgets/ExchangeRateTable';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tỷ giá ngoại tệ hôm nay - VnMarket',
  description: 'Cập nhật tỷ giá USD, EUR, GBP, JPY, CNY theo Vietcombank. Tỷ giá mua vào, bán ra mới nhất.',
};

export default function TyGiaPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8">
      <section className="bg-card rounded-xl border shadow-sm p-6">
        <h1 className="text-3xl font-bold text-emerald-600 dark:text-emerald-500 uppercase mb-2">
          Tỷ giá ngoại tệ
        </h1>
        <p className="text-sm text-muted-foreground italic mb-6">
          Nguồn: Vietcombank - Cập nhật liên tục trong giờ giao dịch
        </p>
        <ExchangeRateTable />
      </section>
    </div>
  );
}
