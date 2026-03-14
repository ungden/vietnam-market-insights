import { NextResponse } from 'next/server';
import type { NewsItem, NewsResponse } from '@/lib/types';

/**
 * API lấy tin tức kinh tế từ RSS feeds các báo Việt Nam
 * Nguồn: VnExpress, Tuổi Trẻ
 * Scan RSS mỗi ngày để lấy tin tức mới nhất
 */

// Danh sách RSS feeds
const RSS_FEEDS = [
  {
    url: 'https://vnexpress.net/rss/kinh-doanh.rss',
    source: 'VnExpress',
  },
  {
    url: 'https://tuoitre.vn/rss/kinh-doanh.rss',
    source: 'Tuổi Trẻ',
  },
  {
    url: 'https://vnexpress.net/rss/kinh-doanh/hang-hoa.rss',
    source: 'VnExpress Hàng hóa',
  },
];

// Cache tin tức
let cachedNews: NewsResponse | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 phút

/**
 * Parse XML RSS feed thành danh sách tin tức
 */
function parseRssFeed(xml: string, source: string): NewsItem[] {
  const items: NewsItem[] = [];

  // Tìm tất cả <item> blocks
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let itemMatch;

  while ((itemMatch = itemRegex.exec(xml)) !== null) {
    const itemXml = itemMatch[1];

    // Parse từng trường
    const title = extractTag(itemXml, 'title');
    const link = extractTag(itemXml, 'link');
    const pubDate = extractTag(itemXml, 'pubDate');
    const description = extractDescription(itemXml);
    const imageUrl = extractImageUrl(itemXml);

    if (title && link) {
      items.push({
        id: generateId(link),
        title: cleanText(title),
        description: cleanText(description),
        url: link.trim(),
        imageUrl: imageUrl || '',
        source,
        publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      });
    }
  }

  return items;
}

/**
 * Trích xuất nội dung thẻ XML
 */
function extractTag(xml: string, tag: string): string {
  // Thử CDATA trước
  const cdataRegex = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, 'i');
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1];

  // Thử nội dung thường
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1] : '';
}

/**
 * Trích xuất mô tả từ description (loại bỏ HTML tags và link ảnh)
 */
function extractDescription(itemXml: string): string {
  const raw = extractTag(itemXml, 'description');
  // Loại bỏ thẻ <a> chứa ảnh
  const noImgLink = raw.replace(/<a[^>]*>.*?<img[^>]*>.*?<\/a>/gi, '');
  // Loại bỏ tất cả HTML tags
  const text = noImgLink.replace(/<[^>]+>/g, '').trim();
  return text;
}

/**
 * Trích xuất URL hình ảnh từ RSS item
 */
function extractImageUrl(itemXml: string): string {
  // Thử enclosure trước (thường có trong RSS)
  const enclosureMatch = itemXml.match(/<enclosure[^>]*url="([^"]+)"/i);
  if (enclosureMatch) return enclosureMatch[1];

  // Thử tìm img trong description
  const imgMatch = itemXml.match(/<img[^>]*src="([^"]+)"/i);
  if (imgMatch) return imgMatch[1];

  // Thử media:content
  const mediaMatch = itemXml.match(/<media:content[^>]*url="([^"]+)"/i);
  if (mediaMatch) return mediaMatch[1];

  return '';
}

/**
 * Tạo ID duy nhất từ URL
 */
function generateId(url: string): string {
  // Hash đơn giản từ URL
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Làm sạch text (loại bỏ HTML entities, CDATA, khoảng trắng thừa)
 */
function cleanText(text: string): string {
  return text
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Fetch và gộp tin tức từ tất cả RSS feeds
 */
async function fetchAllNews(): Promise<NewsResponse> {
  const now = Date.now();
  if (cachedNews && now - lastFetchTime < CACHE_DURATION) {
    return cachedNews;
  }

  const allItems: NewsItem[] = [];

  // Fetch song song tất cả RSS feeds
  const feedPromises = RSS_FEEDS.map(async (feed) => {
    try {
      const res = await fetch(feed.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; VnMarketBot/1.0)',
          'Accept': 'application/rss+xml, application/xml, text/xml',
        },
        next: { revalidate: 600 },
      });

      if (!res.ok) {
        console.warn(`[RSS] Không thể fetch ${feed.source}: ${res.status}`);
        return [];
      }

      const xml = await res.text();
      return parseRssFeed(xml, feed.source);
    } catch (error) {
      console.error(`[RSS] Lỗi khi fetch ${feed.source}:`, error);
      return [];
    }
  });

  const results = await Promise.all(feedPromises);
  for (const items of results) {
    allItems.push(...items);
  }

  // Sắp xếp theo thời gian mới nhất
  allItems.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  // Loại bỏ trùng lặp (cùng title)
  const seen = new Set<string>();
  const uniqueItems = allItems.filter((item) => {
    const key = item.title.toLowerCase().slice(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const data: NewsResponse = {
    items: uniqueItems.slice(0, 20), // Lấy tối đa 20 tin
    updatedAt: new Date().toISOString(),
  };

  cachedNews = data;
  lastFetchTime = now;

  return data;
}

export async function GET() {
  try {
    const data = await fetchAllNews();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('[API/news] Lỗi:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể lấy tin tức. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}
