import axios from 'axios';
import { load } from 'cheerio';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SOURCES = [
  { url: 'https://techcrunch.com/feed/', category: 'tech' },
  { url: 'https://finance.yahoo.com/rss/topstories', category: 'finance' },
  { url: 'https://cointelegraph.com/rss', category: 'crypto' },
  { url: 'https://feeds.reuters.com/reuters/technologyNews', category: 'tech' }
];

async function fetchNews() {
  const articles: {
    title: string;
    link: string;
    description: string;
    source: string;
    category: string;
    pub_date: Date;
  }[] = [];

  for (const src of SOURCES) {
    try {
      const { data } = await axios.get<string>(src.url);
      const $ = load(data, { xmlMode: true });

      $('item').each((i, el) => {
        const title = $(el).find('title').text();
        const link = $(el).find('link').text();
        const pubDate = $(el).find('pubDate').text();
        const desc = $(el).find('description').text();

        articles.push({
          title,
          link,
          description: desc.substring(0, 500),
          source: new URL(link).hostname,
          category: src.category,
          pub_date: new Date(pubDate)
        });
      });
    } catch (err) {
      console.error(`Failed to fetch ${src.url}`);
    }
  }

  const unique = Array.from(new Map(articles.map(a => [a.link, a])).values());
  const { error } = await supabase.from('articles').upsert(unique, { onConflict: 'link' });

  if (error) console.error('Insert error:', error);
  else console.log(`Fetched ${unique.length} articles`);
}

fetchNews();