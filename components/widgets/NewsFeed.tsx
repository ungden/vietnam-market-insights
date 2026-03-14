'use client';

import { Clock, Loader2, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import type { NewsItem, NewsResponse } from '@/lib/types';
import { formatTimeAgo } from '@/lib/api';

export function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        const res = await fetch('/api/news');
        if (!res.ok) throw new Error('Không thể lấy tin tức');
        const data: NewsResponse = await res.json();
        setNews(data.items || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground mt-3">Đang tải tin tức...</p>
      </div>
    );
  }

  if (error || news.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-destructive font-medium">
          {error || 'Chưa có tin tức nào'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const featured = news[0];
  const otherNews = news.slice(1, 5);

  return (
    <div className="space-y-8">
      {/* Tin nổi bật */}
      <a
        href={featured.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:shadow-md block"
      >
        <div className="aspect-[2/1] w-full bg-muted overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
          {featured.imageUrl ? (
            <Image
              src={featured.imageUrl}
              alt={featured.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-500/20 to-amber-700/20" />
          )}

          <div className="absolute bottom-0 left-0 right-0 z-20 p-6 sm:p-8 text-white">
            <div className="mb-4 flex items-center gap-3 text-xs font-medium">
              <span className="rounded-full bg-primary px-3 py-1 text-primary-foreground">
                Tiêu điểm
              </span>
              <span className="rounded-full bg-white/20 px-3 py-1">{featured.source}</span>
              <span className="flex items-center gap-1.5 text-white/90">
                <Clock className="h-3.5 w-3.5" />
                {formatTimeAgo(featured.publishedAt)}
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold leading-tight font-serif mb-3">
              {featured.title}
            </h3>
            <p className="text-white/90 line-clamp-2 sm:line-clamp-3 text-sm sm:text-base max-w-3xl">
              {featured.description}
            </p>
          </div>
        </div>
      </a>

      {/* Tin khác */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {otherNews.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col gap-4 hover:opacity-90 transition-opacity"
          >
            <div className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-muted relative">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-blue-700/20 flex items-center justify-center">
                  <ExternalLink className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-primary">{item.source}</span>
                <span>&#8226;</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {formatTimeAgo(item.publishedAt)}
                </span>
              </div>
              <h4 className="font-bold leading-tight text-foreground group-hover:text-primary font-serif text-lg mb-2 transition-colors">
                {item.title}
              </h4>
              <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
