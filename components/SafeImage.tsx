import React, { useMemo, useState } from 'react';

type Props = {
  src: string;
  alt: string;
  className?: string;
};

const FALLBACK_SVG = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#F1F5F9"/>
        <stop offset="1" stop-color="#E2E8F0"/>
      </linearGradient>
    </defs>
    <rect width="800" height="450" fill="url(#g)"/>
    <g fill="none" stroke="#94A3B8" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" opacity="0.85">
      <rect x="110" y="95" width="580" height="260" rx="24"/>
      <path d="M170 300l110-120 90 90 120-140 140 170"/>
      <circle cx="280" cy="180" r="26"/>
    </g>
    <text x="400" y="410" text-anchor="middle" font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto" font-size="22" fill="#64748B">
      Image unavailable
    </text>
  </svg>
`)}`;

function addCacheBuster(url: string) {
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}cb=${Date.now()}`;
}

export const SafeImage: React.FC<Props> = ({ src, alt, className = '' }) => {
  const initialSrc = useMemo(() => src, [src]);
  const [currentSrc, setCurrentSrc] = useState(initialSrc);
  const [didRetry, setDidRetry] = useState(false);

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      loading="lazy"
      onError={(e) => {
        // Avoid infinite loops
        (e.currentTarget as HTMLImageElement).onerror = null;

        // If the browser/SW has a bad cached response, retry once with a cache-busting param.
        if (!didRetry && initialSrc) {
          setDidRetry(true);
          setCurrentSrc(addCacheBuster(initialSrc));
          return;
        }

        // Final fallback: embedded placeholder (works offline and with blockers).
        setCurrentSrc(FALLBACK_SVG);
      }}
    />
  );
};


