'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Settings() {
  const supabase = createClientComponentClient();
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');

  useEffect(() => {
    const loadSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('dark_mode, font_size')
        .eq('id', user.id)
        .single();

      if (data) {
        setDarkMode(data.dark_mode);
        setFontSize(data.font_size || 'medium');
      }
    };
    loadSettings();
  }, []);

  const saveSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const updates = {
      id: user.id,
      dark_mode: darkMode,
      font_size: fontSize,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('profiles').upsert(updates, { onConflict: 'id' });

    if (error) {
      alert('Save failed.');
    } else {
      alert('✅ Settings saved!');
      if (darkMode) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      document.documentElement.className = fontSize;
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Echo Settings</h1>
      <div className="space-y-6 bg-white p-5 rounded-lg shadow-sm">
        <div>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
              className="w-5 h-5 accent-blue-600"
            />
            <span className="font-medium">🌙 Dark Mode</span>
          </label>
        </div>
        <div>
          <label className="block font-medium mb-2">🔤 Text Size</label>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value as any)}
            className="w-full border border-gray-300 rounded px-3 py-2 dark:bg-gray-800"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
        <button
          onClick={saveSettings}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}