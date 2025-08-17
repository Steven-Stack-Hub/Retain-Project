'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import FeedCard from '@/components/FeedCard';
import RefreshMeter from '@/components/RefreshMeter';

export default function Feed() {
  const supabase = createClientComponentClient();
  const [articles, setArticles] = useState<any[]>([]);
  const [refreshCount, setRefreshCount] = useState(0);
  const [threshold, setThreshold] = useState(5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setRefreshCount(profile?.last_refresh_count || 0);
      setThreshold(profile?.refresh_threshold || 5);

      const { data: userArticles } = await supabase.rpc('get_personalized_feed', {
        user_id: user.id,
        max_count: profile?.max_posts || 10
      });

      setArticles(userArticles || []);
      setLoading(false);
    };

    load();
  }, []);

  const handleRefresh = async () => {
    const res = await fetch('/api/refresh', { method: 'POST' });
    const json = await res.json();
    setRefreshCount(json.refresh_count);
    if (json.new_batch) {
      alert('New content available!');
      window.location.reload();
    }
  };

  if (loading) return <div className="text-center py-10">Loading your deep dive...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4">
        <h1 className="text-xl font-semibold">Your Echo Feed</h1>
        <RefreshMeter current={refreshCount} total={threshold} />
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {articles.map(article => (
          <FeedCard key={article.link} article={article} />
        ))}
      </main>

      <button
        onClick={handleRefresh}
        className="fixed bottom-6 right-6 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-xl hover:bg-blue-700 transition"
        aria-label="Refresh"
      >
        ↻
      </button>
    </div>
  );
}