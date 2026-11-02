import React, { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { resolveAssetUrl } from '../lib/assets';

interface ResilientImageProps {
  srcKeyOrUrl: string;
  alt: string;
  fallbackLabel?: string;
  className?: string;
}

export const ResilientImage: React.FC<ResilientImageProps> = ({
  srcKeyOrUrl,
  alt,
  fallbackLabel,
  className = 'w-full h-full object-cover',
}) => {
  const [failed, setFailed] = useState(false);
  const resolvedSrc = resolveAssetUrl(srcKeyOrUrl);

  if (failed || !resolvedSrc) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-teal-50/60 text-slate-500 p-6 text-center ${className}`}
      >
        <FlaskConical className="w-8 h-8 text-teal-700/70 mb-2 shrink-0" />
        <span className="text-xs font-medium text-slate-700 max-w-xs">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
