// components/ShareButton.tsx
'use client';

import { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';

interface ShareButtonProps {
  title: string;
}

export default function ShareButton({ title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center space-x-2 bg-terracotta hover:bg-terracotta/90 text-white px-4 py-2 rounded-lg font-medium transition-colors"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          <span>Link Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          <span>Share Post</span>
        </>
      )}
    </button>
  );
}
