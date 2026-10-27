import React from 'react';
import { Trophy, Users, ArrowRight, Flame } from 'lucide-react';
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* KPI 1: Total Votes */}
        <div className="bg-[#373038] border border-[#4d4250] rounded-2xl p-4 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FB702D]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="text-xs text-[#c9bfcc] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-[#FB702D]" />
            <span>Total Votes Cast</span>
          </div>
          <div className="text-3xl font-black text-white font-mono">{totalVotes}</div>
          <div className="text-[11px] text-[#b8adb9] mt-1 font-medium">Recorded paper ballots</div>
        </div>

        {/* KPI 2: Leader Monster */}
        <div className="bg-[#373038] border border-[#4d4250] rounded-2xl p-4 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFC341]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="text-xs text-[#c9bfcc] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-[#FFC341]" />
            <span>Leader Monster</span>
          </div>
          <div className="text-lg font-bold text-white truncate flex items-center gap-3">
            <MonsterAvatar monster={leader} size="md" className="rounded-xl shadow ring-1 ring-[#FFC341]/40" />
            <div>
              <div className="font-gothic text-xl text-[#FFC341] tracking-wide leading-tight">
                {leader ? `#${leader.number} ${leader.name}` : '-'}
              </div>
              <div className="text-xs text-[#88E032] font-mono font-bold">
                {leader && leader.votes > 0
                  ? `${leader.votes} votes (${totalVotes > 0 ? ((leader.votes / totalVotes) * 100).toFixed(1) : 0}%)`
                  : 'No votes recorded'}
              </div>
            </div>
          </div>
        </div>

        {/* KPI 3: Unique Members */}
        <div className="bg-[#373038] border border-[#4d4250] rounded-2xl p-4 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#862FE0]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="text-xs text-[#c9bfcc] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#862FE0]" />
            <span>Unique Voters</span>
          </div>
          <div className="text-3xl font-black text-white font-mono">{allUniqueMemberships.size}</div>
          <div className="text-[11px] text-[#b8adb9] mt-1 font-medium">Distinct memberships counted</div>
        </div>
      </div>

      {/* Global Table */}
      <div className="bg-[#373038] border border-[#4d4250] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#4d4250] flex items-center justify-between bg-[#2d272f]">
          <div>
            <h2 className="font-gothic text-xl text-white tracking-wide flex items-center gap-2">
              <span className="text-[#FB702D]">🎃</span>
              <span>Global Standings (10 Monsters)</span>
            </h2>
            <p className="text-xs text-[#c9bfcc]">Ranked from highest to lowest vote count</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#241f26] border-b border-[#4d4250] text-[#c9bfcc]">
                <th className="py-3 px-4 font-bold w-14 text-center">Rank</th>
                <th className="py-3 px-4 font-bold">Monster</th>
                <th className="py-3 px-4 font-bold text-right">Total Votes</th>
                <th className="py-3 px-4 font-bold text-right">% of Total</th>
                <th className="py-3 px-4 font-bold text-center">Unique Members</th>
                <th className="py-3 px-4 font-bold w-48">Progress</th>
                <th className="py-3 px-4 font-bold text-center w-32">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#493e4c]/70">
              {sortedMonsters.map((monster, index) => {
                const percent = totalVotes > 0 ? ((monster.votes / totalVotes) * 100).toFixed(1) : 0;
                const uniqueCount = (monster.votesByMembership || []).length;
                const isLeader = index === 0 && monster.votes > 0;

                return (
                  <tr
                    key={monster.number}
                    className="hover:bg-[#433845] transition-colors"
                  >
                    <td className="py-3 px-4 text-center font-mono font-black text-slate-300">
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
                          <span className="font-gothic text-lg text-white tracking-wide block">
                            #{monster.number} {monster.name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-sm text-[#FFC341]">
                      {monster.votes}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#88E032]">
                      {percent}%
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-white">
                      {uniqueCount}
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-full bg-[#211c22] rounded-full h-2.5 overflow-hidden border border-[#4d4250]">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, Math.max(0, percent))}%`,
                            backgroundColor: monster.color || '#FB702D'
                          }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onSelectMonster(monster.number)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#862FE0] hover:bg-[#9948ef] text-white text-xs font-bold transition shadow-sm"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
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
