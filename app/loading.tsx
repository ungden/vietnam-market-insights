import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="h-10 w-10 animate-spin text-amber-500 mb-4" />
      <p className="text-muted-foreground text-sm">Đang tải dữ liệu...</p>
    </div>
  );
}
