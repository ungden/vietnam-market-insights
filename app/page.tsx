import { GoldPriceTable } from '@/components/widgets/GoldPriceTable';
import { GoldPriceChart } from '@/components/charts/GoldPriceChart';
import { NewsFeed } from '@/components/widgets/NewsFeed';
import { ShareButton } from '@/components/widgets/ShareButton';
import { MarketOverviewWidget } from '@/components/widgets/MarketOverviewWidget';
import { ConverterTool } from '@/components/widgets/ConverterTool';
import { UpdateTime } from '@/components/widgets/UpdateTime';

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8">

      {/* Phần chính: Giá vàng */}
      <section id="gia-vang" className="bg-card rounded-xl border shadow-sm p-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-amber-500 uppercase">Giá Vàng</h1>
          <ShareButton />
        </div>
        <UpdateTime />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <GoldPriceTable />
          <GoldPriceChart />
        </div>
      </section>

      {/* Tổng quan thị trường & Công cụ quy đổi */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MarketOverviewWidget />
        <ConverterTool />
      </section>

      {/* Phần tin tức */}
      <section id="tin-tuc">
        <div className="mb-6 flex items-center justify-between border-b border-primary/20 pb-2">
          <h2 className="text-2xl font-bold tracking-tight uppercase text-primary border-b-2 border-primary pb-2 -mb-[10px]">
            Tin tức nổi bật
          </h2>
        </div>
        <NewsFeed />
      </section>
    </div>
  );
}
