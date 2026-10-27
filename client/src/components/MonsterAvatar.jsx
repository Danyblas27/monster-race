import React, { useState } from 'react';

/**
 * MonsterAvatar displays the monster image from client/public/monsters/[filename]
 * with automatic fallback to emoji if the image doesn't exist or fails to load.
 */
export default function MonsterAvatar({
  monster,
  size = 'md', // 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'card'
  className = ''
}) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs rounded',
    sm: 'w-8 h-8 text-sm rounded-md',
    md: 'w-11 h-11 text-lg rounded-lg',
    lg: 'w-16 h-16 text-2xl rounded-xl',
    xl: 'w-24 h-24 text-4xl rounded-2xl',
    card: 'w-full h-32 rounded-t-xl'
  };

  const imageSrc = monster?.image || `/monsters/${monster?.number}.png`;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden bg-slate-950 border border-slate-800 ${sizeClasses[size] || sizeClasses.md} ${className}`}
      style={{
        borderColor: monster?.color ? `${monster.color}40` : undefined,
      }}
    >
      {!imgError && imageSrc ? (
        <img
          src={imageSrc}
          alt={monster?.name || 'Monster'}
          className="w-full h-full object-cover object-top"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <span className="select-none font-sans">{monster?.emoji || '👾'}</span>
      )}
    </div>
  );
}
