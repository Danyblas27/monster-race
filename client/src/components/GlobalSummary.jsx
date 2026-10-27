import React from 'react';
import { Trophy, Users, ArrowRight } from 'lucide-react';
import MonsterAvatar from './MonsterAvatar';

export default function GlobalSummary({ monsters, totalVotes, onSelectMonster }) {
  // Sort descending by votes
  const sortedMonsters = [...monsters].sort((a, b) => b.votes - a.votes);
  const leader = sortedMonsters[0];

  // Calculate unique voters across all monsters
  const allUniqueMemberships = new Set();
  for (const m of monsters) {
    for (const mem of (m.memberships || [])) {
      allUniqueMemberships.add(mem);
    }
  }

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium mb-1">Total Votes Cast</div>
          <div className="text-2xl font-bold text-white font-mono">{totalVotes}</div>
          <div className="text-[11px] text-slate-500 mt-1">Recorded paper ballots</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Leader Monster</span>
          </div>
          <div className="text-lg font-bold text-white truncate flex items-center gap-3">
            <MonsterAvatar monster={leader} size="lg" className="rounded-xl shadow" />
            <div>
              <div className="font-extrabold text-base text-white">
                {leader ? `#${leader.number} ${leader.name}` : '-'}
              </div>
              <div className="text-[11px] text-slate-400 font-normal">
                {leader && leader.votes > 0
                  ? `${leader.votes} votes (${totalVotes > 0 ? ((leader.votes / totalVotes) * 100).toFixed(1) : 0}%)`
                  : 'No votes recorded'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span>Unique Participating Members</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{allUniqueMemberships.size}</div>
          <div className="text-[11px] text-slate-500 mt-1">Distinct voters counted</div>
        </div>
      </div>

      {/* Global Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Global Vote Standings (10 Monsters)</h2>
            <p className="text-xs text-slate-400">Ranked by total votes in descending order</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400">
                <th className="py-3 px-4 font-semibold w-12 text-center">Rank</th>
                <th className="py-3 px-4 font-semibold">Monster</th>
                <th className="py-3 px-4 font-semibold text-right">Total Votes</th>
                <th className="py-3 px-4 font-semibold text-right">% of Total</th>
                <th className="py-3 px-4 font-semibold text-center">Unique Members</th>
                <th className="py-3 px-4 font-semibold w-48">Progress</th>
                <th className="py-3 px-4 font-semibold text-center w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {sortedMonsters.map((monster, index) => {
                const percent = totalVotes > 0 ? ((monster.votes / totalVotes) * 100).toFixed(1) : 0;
                const uniqueCount = (monster.votesByMembership || []).length;
                const isLeader = index === 0 && monster.votes > 0;

                return (
                  <tr
                    key={monster.number}
                    className="hover:bg-slate-800/40 transition"
                  >
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-400">
                      {isLeader
                        ? '🥇'
                        : index === 1 && monster.votes > 0
                        ? '🥈'
                        : index === 2 && monster.votes > 0
                        ? '🥉'
                        : `${index + 1}`}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <MonsterAvatar monster={monster} size="md" className="rounded-lg shadow" />
                        <div>
                          <span className="font-bold text-white text-xs sm:text-sm">
                            #{monster.number} {monster.name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-sm text-white">
                      {monster.votes}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      {percent}%
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-300">
                      {uniqueCount}
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, Math.max(0, percent))}%`,
                            backgroundColor: monster.color || '#a855f7'
                          }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onSelectMonster(monster.number)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
