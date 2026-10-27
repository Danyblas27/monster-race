import React, { useState } from 'react';

/**
 * MonsterAvatar displays the monster image from client/public/monsters/[number].png (or .jpg, .webp)
 * with automatic fallback to emoji if the image doesn't exist or fails to load.
 */
export default function MonsterAvatar({
  monster,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  className = ''
}) {
  const [imgError, setImgError] = useState(false);

  // Size mappings
  const sizeClasses = {
    sm: 'w-7 h-7 text-sm rounded-md',
    md: 'w-10 h-10 text-xl rounded-lg',
    lg: 'w-14 h-14 text-2xl rounded-xl',
    xl: 'w-20 h-20 text-4xl rounded-2xl'
  };

  // Determine potential image path
  const imageSrc = monster?.image || `/monsters/${monster?.number}.png`;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden bg-slate-950 border border-slate-800 ${sizeClasses[size] || sizeClasses.md} ${className}`}
      style={{
        boxShadow: monster?.color ? `0 0 10px ${monster.color}15` : undefined
      }}
    >
      {!imgError && imageSrc ? (
        <img
          src={imageSrc}
          alt={monster?.name || 'Monster'}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="select-none">{monster?.emoji || '👾'}</span>
      )}
    </div>
  );
}
