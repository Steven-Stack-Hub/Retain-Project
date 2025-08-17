'use client';

import { useState } from 'react';
import AudioPlayer from './AudioPlayer';

export default function FeedCard({ article }) {
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSummarize = async () => {
    if (summary) {
      setIsExpanded(!isExpanded);
      return;
    }
    setIsSummarizing(true);
    const res = await fetch('/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: article.description, maxLength: 120 })
    });
    const json = await res.json();
    setSummary(json.summary || 'Summary not available.');
    setIsExpanded(true);
    setIsSummarizing(false);
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border">
      <h2 className="font-semibold text-gray-900">{article.title}</h2>
      <p className="text-sm text-gray-500 mt-1">via {article.source}</p>

      {!summary ? (
        <p className="mt-3 text-gray-700 text-sm line-clamp-3">{article.description}</p>
      ) : (
        isExpanded && <p className="mt-3 text-gray-700 italic">{summary}</p>
      )}

      <div className="mt-4 space-x-3">
        <button
          onClick={handleSummarize}
          disabled={isSummarizing}
          className="text-xs text-blue-600 hover:underline"
        >
          {isSummarizing ? 'Summarizing...' : summary ? 'Show Summary' : 'Get AI Summary'}
        </button>
        <AudioPlayer text={summary || article.description} />
        <a href={article.link} target="_blank" className="text-xs text-gray-600 hover:underline">
          Read Full Article ↗
        </a>
      </div>
    </div>
  );
}