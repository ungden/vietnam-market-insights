'use client';

import { Clock, Loader2, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import type { NewsItem, NewsResponse } from '@/lib/types';
import { formatTimeAgo } from '@/lib/api';

export function FullNewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string>('all');

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
        setError(err instanceof Error ? err.message : 'Lỗi');
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  // Lấy danh sách nguồn duy nhất
  const sources = Array.from(new Set(news.map((n) => n.source)));

  const filteredNews = sourceFilter === 'all'
    ? news
    : news.filter((n) => n.source === sourceFilter);

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
      <div className="text-center py-20">
        <p className="text-destructive font-medium">{error || 'Chưa có tin tức'}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bộ lọc nguồn */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setSourceFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            sourceFilter === 'all'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background text-muted-foreground border-border hover:bg-muted'
          }`}
        >
          Tất cả ({news.length})
        </button>
        {sources.map((src) => {
          const count = news.filter((n) => n.source === src).length;
          return (
            <button
              key={src}
              onClick={() => setSourceFilter(src)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                sourceFilter === src
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:bg-muted'
              }`}
            >
              {src} ({count})
            </button>
          );
        })}
      </div>

      {/* Danh sách tin tức */}
      <div className="space-y-4">
        {filteredNews.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex gap-4 sm:gap-6 p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors"
          >
            {/* Ảnh */}
            <div className="flex-shrink-0 w-24 h-24 sm:w-40 sm:h-28 rounded-lg bg-muted overflow-hidden relative">
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
                <div className="w-full h-full flex items-center justify-center">
                  <ExternalLink className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Nội dung */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 text-xs text-muted-foreground">
                <span className="font-semibold text-primary">{item.source}</span>
                <span>&#8226;</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTimeAgo(item.publishedAt)}
                </span>
              </div>
              <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1.5">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 hidden sm:block">
                {item.description}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
