'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Archive() {
  const supabase = createClientComponentClient();
  const [reads, setReads] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      const {  { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('article_reads')
        .select('*, articles(*)')
        .eq('user_id', user.id)
        .order('read_at', { ascending: false });

      if (search) {
        query = query.ilike('articles.title', `%${search}%`);
      }

      const { data } = await query;
      setReads(data || []);
    };
    load();
  }, [search]);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Echo Archive</h1>
      <input
        type="text"
        placeholder="Search past reads..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 mb-6"
      />
      <div className="space-y-4">
        {reads.map(r => (
          <div key={r.id} className="bg-white p-4 rounded shadow-sm border">
            <a href={r.articles.link} target="_blank" className="font