'use client';

import { useState } from 'react';

export default function AudioPlayer({ text }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const speak = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  return (
    <button
      onClick={speak}
      className={`text-xs px-3 py-1 rounded-full ${
        isPlaying ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
      }`}
    >
      {isPlaying ? '⏹ Stop' : '▶ Listen'}
    </button>
  );
}