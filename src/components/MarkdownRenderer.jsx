import React from 'react';

export default function MarkdownRenderer({ text }) {
  const html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-orange-600 hover:underline">$1</a>')
    .split('\n')
    .map(line => {
      if (line.trim().startsWith('- ')) {
        return `<div class="flex items-start"><span class="mr-2 mt-1 text-orange-500 shrink-0">&bull;</span><span>${line.trim().substring(2)}</span></div>`;
      }
      return `<p>${line}</p>`;
    }).join('');

  return <div className="text-sm space-y-2" dangerouslySetInnerHTML={{ __html: html }} />;
}