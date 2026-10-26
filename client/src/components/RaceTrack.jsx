import React from 'react';
import { Crown, Flame, Flag, Trophy, Medal } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RaceTrack({ monsters, totalVotes, onTriggerConfetti }) {
  // Sort for podium
  const sorted = [...monsters].sort((a, b) => b.votes - a.votes);
  const maxVotes = Math.max(...monsters.map((m) => m.votes), 1);
  const leader = sorted[0];

  const handleConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
    if (onTriggerConfetti) onTriggerConfetti();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <span>🏁 Pista de Carrera en Vivo</span>
            {leader && leader.votes > 0 && (
              <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2.5 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                Líder: {leader.name} ({leader.votes} votos)
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400">
            Los monstruos avanzan conforme se cuentan los votos de los papelitos
          </p>
        </div>

        {/* Podium Top 3 Mini Bar */}
        <div className="flex items-center gap-2">
          {sorted.slice(0, 3).map((m, idx) => {
            const medals = ['🥇', '🥈', '🥉'];
            return (
              <div
                key={m.number}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs"
              >
                <span>{medals[idx]}</span>
                <span className="text-sm">{m.emoji}</span>
                <span className="font-bold text-slate-200">#{m.number}</span>
                <span className="text-slate-400 text-[10px]">({m.votes})</span>
              </div>
            );
          })}

          <button
            onClick={handleConfetti}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition"
            title="Lanzar confeti de celebración"
          >
            🎉
          </button>
        </div>
      </div>

      {/* 10 Race Track Lanes */}
      <div className="space-y-2.5">
        {monsters.map((monster) => {
          // Calculate percentage position
          // Base min width 4% so the monster is always visible at start line
          const progressPercent = maxVotes > 0 ? (monster.votes / maxVotes) * 90 : 0;
          const totalPercent = totalVotes > 0 ? ((monster.votes / totalVotes) * 100).toFixed(1) : 0;
          const isLeader = leader.votes > 0 && monster.votes === leader.votes;

          return (
            <div
              key={monster.number}
              className={`p-2 rounded-2xl bg-slate-950/70 border transition-all relative ${
                isLeader
                  ? 'border-amber-500/40 shadow-lg shadow-amber-500/5'
                  : 'border-slate-800/80'
              }`}
            >
              {/* Lane Info Header */}
              <div className="flex items-center justify-between text-xs mb-1.5 px-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-md flex items-center justify-center font-black text-[10px] text-white shadow"
                    style={{ backgroundColor: monster.color }}
                  >
                    {monster.number}
                  </span>
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    {monster.name}
                    {isLeader && <Crown className="w-3.5 h-3.5 text-amber-400 animate-bounce" />}
                  </span>
                </div>

                <div className="flex items-center gap-3 font-mono">
                  <span className="text-slate-400 text-[11px]">{totalPercent}% del total</span>
                  <span
                    className="font-black px-2 py-0.5 rounded-md text-xs"
                    style={{
                      backgroundColor: `${monster.color}22`,
                      color: monster.color
                    }}
                  >
                    {monster.votes} {monster.votes === 1 ? 'voto' : 'votos'}
                  </span>
                </div>
              </div>

              {/* Race Track Lane Bar */}
              <div className="h-9 bg-slate-900 rounded-xl relative overflow-hidden flex items-center px-1 border border-slate-800/60">
                {/* Lane start markings */}
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-slate-800 border-r border-slate-700/50" />

                {/* Dashed track center line */}
                <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 border-b border-dashed border-slate-800/70 pointer-events-none" />

                {/* Finish Line Checkered Pattern */}
                <div
                  className="absolute right-0 top-0 bottom-0 w-6 flex flex-col justify-between opacity-40 pointer-events-none"
                  style={{
                    backgroundImage: 'repeating-conic-gradient(#ffffff 0% 25%, #000000 0% 50%)',
                    backgroundPosition: '0 0, 4px 4px',
                    backgroundSize: '8px 8px'
                  }}
                  title="Meta"
                />

                {/* Progress Fill behind monster */}
                <div
                  className="absolute left-0 top-0 bottom-0 rounded-l-xl opacity-20 transition-all duration-700 ease-out"
                  style={{
                    width: `${Math.max(2, progressPercent + 4)}%`,
                    backgroundColor: monster.color
                  }}
                />

                {/* The Racing Monster Runner */}
                <div
                  className="absolute transition-all duration-700 ease-out flex items-center gap-1 z-10"
                  style={{
                    left: `${progressPercent}%`,
                    transform: 'translateX(0%)'
                  }}
                >
                  <div
                    className="p-1 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-125 cursor-pointer"
                    style={{
                      backgroundColor: `${monster.color}33`,
                      border: `1.5px solid ${monster.color}`
                    }}
                  >
                    <span className="text-xl animate-pulse">{monster.emoji}</span>
                  </div>
                  {monster.votes > 0 && (
                    <span
                      className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950/90 border border-slate-700 text-white shadow"
                    >
                      {monster.votes}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
