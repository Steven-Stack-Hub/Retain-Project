'use client';

import { useState } from 'react';
// @ts-ignore
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// @ts-ignore
import { useRouter } from 'next/navigation';

const TOPICS = [
  'AI', 'Cloud Computing', 'Crypto', 'Digital Marketing', 'Software Engineering',
  'Stocks', 'Bonds', 'Investing', 'Venture Capital', 'Real Estate',
  'Credit Cards & Scores', 'Accounting', 'Cybersecurity', 'Tech', 'Data Science',
  'Computer Science', 'AI Infrastructure', 'Shopping', 'Culture', 'Fitness'
] as const;

type Topic = typeof TOPICS[number];

const FORMAT_OPTIONS = [
  { id: 'deep_dive', label: 'Mostly Deep Dives' },
  { id: 'short_dive', label: 'Mostly Short Summaries' },
  { id: 'mixed', label: 'A Little of Both' }
] as const;

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [source, setSource] = useState('');
  const [interests, setInterests] = useState<Topic[]>([]);
  const [format, setFormat] = useState<string>('deep_dive');
  const [refreshCount, setRefreshCount] = useState<number>(7);
  const [postCount, setPostCount] = useState<number>(10);

  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      interests,
      preferred_format: format,
      refresh_threshold: refreshCount,
      max_posts: postCount,
      last_refresh_count: 0,
      last_cycle_at: new Date().toISOString(),
      dark_mode: false,
      font_size: 'medium'
    }, { onConflict: 'id' });

    if (!error) {
      router.push('/feed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Welcome to Echo</h1>

        {step === 1 && (
          <div>
            <p className="mb-4">How did you hear about us?</p>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g., Instagram"
              className="w-full border border-gray-300 rounded p-2 mb-6"
            />
            <button onClick={handleNext} className="bg-blue-600 text-white px-6 py-2 rounded">Next</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="mb-4 font-medium">Select your top 3+ interests:</p>
            <small className="text-gray-500 block mb-3">Choose at least 3</small>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto mb-6">
              {TOPICS.map(topic => (
                <label key={topic} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={interests.includes(topic)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setInterests([...interests, topic]);
                      } else {
                        setInterests(interests.filter(t => t !== topic));
                      }
                    }}
                    disabled={!interests.includes(topic) && interests.length >= 5}
                  />
                  <span className="text-sm">{topic}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-between">
              <button onClick={handleBack} className="text-gray-600">Back</button>
              {interests.length >= 3 ? (
                <button onClick={handleNext} className="bg-blue-600 text-white px-6 py-2 rounded">Next</button>
              ) : (
                <span className="text-red-500 text-sm">Choose at least 3</span>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="mb-4 font-medium">Preferred content style?</p>
            <div className="space-y-3 mb-6">
              {FORMAT_OPTIONS.map(opt => (
                <label key={opt.id} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value={opt.id}
                    checked={format === opt.id}
                    onChange={() => setFormat(opt.id)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label>Refresh threshold before new batch (5–8):</label>
                <input
                  type="range"
                  min="5"
                  max="8"
                  value={refreshCount}
                  onChange={(e) => setRefreshCount(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-center">{refreshCount} refreshes</p>
              </div>
              <div>
                <label>Posts per batch (10–20):</label>
                <input
                  type="range"
                  min="10"
                  max="20"
                  value={postCount}
                  onChange={(e) => setPostCount(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-center">{postCount} posts</p>
              </div>
            </div>
            <div className="flex justify-between">
              <button onClick={handleBack} className="text-gray-600">Back</button>
              <button onClick={handleSubmit} className="bg-green-600 text-white px-6 py-2 rounded">Finish & Go to Feed</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}