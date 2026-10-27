import React, { useState } from 'react';
import { Search, Plus, Minus, Trash2, UserPlus, Check } from 'lucide-react';
import MonsterAvatar from './MonsterAvatar';

export default function MonsterDetailTab({
  monsters,
  selectedMonsterNumber,
  onSelectMonster,
  onAddVote,
  onRemoveVote
}) {
  const [filterMembership, setFilterMembership] = useState('');
  const [quickMembership, setQuickMembership] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const currentMonster = monsters.find((m) => m.number === selectedMonsterNumber) || monsters[0];

  // List of aggregated voters for this monster (each membership appears once with count)
  const votersList = currentMonster?.votesByMembership || [];

  // Filtered by search input
  const filteredVoters = filterMembership.trim()
    ? votersList.filter((v) => v.membership.includes(filterMembership.trim()))
    : votersList;

  const handleQuickAdd = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    const mem = quickMembership.trim();
    if (!/^\d{3,4}$/.test(mem)) {
      setErrorMsg('Membership number must be 3 or 4 numeric digits.');
      return;
    }

    const success = await onAddVote({
      monsterNumber: currentMonster.number,
      membership: mem,
      count: 1
    });

    if (success) {
      setQuickMembership('');
    }
  };

  return (
    <div className="space-y-6">
      {/* 10 Monster Selection - LARGE CARDS (2 rows of 5 on desktop) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              Select a Monster
            </h2>
            <p className="text-xs text-slate-400">Click a card to inspect its voter table below</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            10 Monsters
          </span>
        </div>

        {/* 10 Large Monster Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {monsters.map((m) => {
            const isSelected = m.number === currentMonster.number;
            return (
              <div
                key={m.number}
                onClick={() => onSelectMonster(m.number)}
                className={`flex flex-col rounded-2xl overflow-hidden border transition-all duration-200 cursor-pointer group text-left relative ${
                  isSelected
                    ? 'border-purple-500 ring-2 ring-purple-500/80 bg-slate-800 shadow-xl shadow-purple-500/10 scale-[1.02]'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 hover:scale-[1.01]'
                }`}
              >
                {/* Large Card Image Area */}
                <div className="w-full h-40 sm:h-44 relative overflow-hidden bg-slate-950 flex items-center justify-center">
                  <MonsterAvatar
                    monster={m}
                    size="fill"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Monster Number Badge */}
                  <div className="absolute top-2 left-2 z-10">
                    <span
                      className="px-2 py-0.5 rounded-md text-xs font-black text-white shadow-lg flex items-center gap-1"
                      style={{ backgroundColor: m.color || '#8b5cf6' }}
                    >
                      #{m.number}
                    </span>
                  </div>

                  {/* Vote Count Badge */}
                  <div className="absolute top-2 right-2 z-10">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-950/90 text-purple-300 border border-slate-700/80 shadow">
                      {m.votes} {m.votes === 1 ? 'vote' : 'votes'}
                    </span>
                  </div>

                  {/* Selected checkmark overlay */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-purple-600/15 border-2 border-purple-500 rounded-t-2xl pointer-events-none flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg">
                        <Check className="w-5 h-5 stroke-[3]" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Bottom: Name */}
                <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
                  <span className="font-extrabold text-sm text-white truncate">
                    {m.name}
                  </span>
                  <span className="text-base select-none shrink-0 ml-1">
                    {m.emoji}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Monster Detail Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 border-2 border-slate-700 shadow-xl">
              <MonsterAvatar
                monster={currentMonster}
                size="fill"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="px-2.5 py-0.5 rounded-md text-xs font-black text-white shadow"
                  style={{ backgroundColor: currentMonster.color || '#8b5cf6' }}
                >
                  #{currentMonster.number}
                </span>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  {currentMonster.name}
                </h2>
                <span className="text-xl">{currentMonster.emoji}</span>
              </div>
              <div className="text-xs text-slate-400">
                Total accumulated: <strong className="text-white font-mono text-base">{currentMonster.votes}</strong> votes from{' '}
                <strong className="text-white font-mono text-base">{votersList.length}</strong> distinct memberships
              </div>
            </div>
          </div>

          {/* Quick add vote form for this monster */}
          <form onSubmit={handleQuickAdd} className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={quickMembership}
                onChange={(e) => setQuickMembership(e.target.value.replace(/\D/g, ''))}
                placeholder="Membership (3-4 digits)"
                className="w-48 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <button
              type="submit"
              disabled={!/^\d{3,4}$/.test(quickMembership.trim())}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow ${
                /^\d{3,4}$/.test(quickMembership.trim())
                  ? 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer shadow-purple-600/30'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Vote</span>
            </button>
          </form>
        </div>

        {errorMsg && (
          <div className="mt-2 text-xs text-rose-400">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Filter bar */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
            <span>Voter Memberships List</span>
            <span className="text-slate-500 font-normal">
              ({filteredVoters.length} {filteredVoters.length === 1 ? 'member' : 'members'})
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search table by membership..."
              value={filterMembership}
              onChange={(e) => setFilterMembership(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* TABLE: Each membership appears ONCE with its vote count */}
        <div className="mt-3 overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400">
                <th className="py-3 px-4 font-semibold w-12 text-center">#</th>
                <th className="py-3 px-4 font-semibold">Membership</th>
                <th className="py-3 px-4 font-semibold text-center">Vote Count</th>
                <th className="py-3 px-4 font-semibold text-right">% of Monster</th>
                <th className="py-3 px-4 font-semibold text-center w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredVoters.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500 italic">
                    {filterMembership
                      ? 'No matches found for that membership search.'
                      : 'No votes recorded for this monster yet.'}
                  </td>
                </tr>
              ) : (
                filteredVoters.map((item, idx) => {
                  const percentOfMonster = currentMonster.votes > 0
                    ? ((item.count / currentMonster.votes) * 100).toFixed(1)
                    : 0;

                  return (
                    <tr
                      key={item.membership}
                      className="hover:bg-slate-800/40 transition"
                    >
                      <td className="py-3 px-4 text-center text-slate-500 font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-white text-sm">
                        {item.membership}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {item.count} {item.count === 1 ? 'vote' : 'votes'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-300">
                        {percentOfMonster}%
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Add 1 vote button */}
                          <button
                            onClick={() => onAddVote({ monsterNumber: currentMonster.number, membership: item.membership, count: 1 })}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                            title={`Add 1 vote to membership ${item.membership}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>

                          {/* Minus 1 vote button */}
                          <button
                            onClick={() => onRemoveVote(currentMonster.number, item.membership, 1, false)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                            title={`Subtract 1 vote from membership ${item.membership}`}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete all votes button */}
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete all ${item.count} votes for membership ${item.membership} on ${currentMonster.name}?`)) {
                                onRemoveVote(currentMonster.number, item.membership, item.count, true);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 border border-rose-800/40 transition ml-1"
                            title={`Delete all votes for membership ${item.membership}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
