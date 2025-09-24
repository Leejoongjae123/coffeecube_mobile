import React from 'react';
import KoreanKeyboard from './components/KoreanKeyboard';

export default function TestPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full p-4 bg-gray-50">
      <KoreanKeyboard />
    </div>
  );
}
