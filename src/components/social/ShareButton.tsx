import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareButtonProps {
  url?: string;
  title?: string;
  className?: string;
}

export default function ShareButton({ url, title, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = url || window.location.href;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={cn(
        'flex items-center gap-2 text-spotify-muted hover:text-white transition-colors',
        className
      )}
      aria-label={`Share ${title || 'link'}`}
      title={copied ? 'Link copied!' : 'Share'}
    >
      {copied ? (
        <Check className="w-5 h-5 text-spotify-green" />
      ) : (
        <Share2 className="w-5 h-5" />
      )}
      {copied && (
        <span className="text-xs text-spotify-green font-medium animate-fade-in">
          Copied!
        </span>
      )}
    </button>
  );
}
