import React from 'react';

export default function LanguageFlag({ lang }) {
  const flags = { fr: '🇫🇷', en: '🇬🇧' };
  return <span className="text-xl">{flags[lang] || '🌐'}</span>;
}