import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="text-8xl font-bold text-muted-foreground/30 mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-2">Không tìm thấy trang</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Trang bạn đang tìm không tồn tại hoặc đã bị di chuyển.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:opacity-90 transition-opacity"
      >
        <Home className="h-4 w-4" />
        Về trang chủ
      </Link>
    </div>
  );
}
