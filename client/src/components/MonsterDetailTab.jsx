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
      {/* 10 Monster Selection - LARGE HALLOWEEN CARDS */}
      <div className="bg-[#373038] border border-[#4d4250] rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#4d4250]">
          <div>
            <h2 className="font-gothic text-2xl text-white tracking-wide">
              Select a Monster
            </h2>
            <p className="text-xs text-[#c9bfcc]">Click a card below to inspect its voter table</p>
          </div>
          <span className="text-xs text-[#FFC341] font-mono font-bold uppercase tracking-wider bg-[#211c22] px-2.5 py-1 rounded-md border border-[#4d4250]">
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
                    ? 'border-[#862FE0] ring-2 ring-[#862FE0] bg-[#443846] shadow-xl shadow-[#862FE0]/20 scale-[1.02]'
                    : 'bg-[#2b242d] border-[#4d4250] hover:border-[#FB702D]/60 hover:bg-[#3d323e] hover:scale-[1.01]'
                }`}
              >
                {/* Large Card Image Area */}
                <div className="w-full h-40 sm:h-44 relative overflow-hidden bg-[#211c22] flex items-center justify-center">
                  <MonsterAvatar
                    monster={m}
                    size="fill"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Monster Number Badge in Halloween Orange */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className="px-2 py-0.5 rounded-md text-xs font-black text-white bg-[#FB702D] shadow-lg flex items-center gap-1">
                      #{m.number}
                    </span>
                  </div>

                  {/* Vote Count Badge in Halloween Lime Green */}
                  <div className="absolute top-2 right-2 z-10">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-[#211c22]/95 text-[#88E032] border border-[#88E032]/40 shadow">
                      {m.votes} {m.votes === 1 ? 'vote' : 'votes'}
                    </span>
                  </div>

                  {/* Selected checkmark overlay */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-[#862FE0]/20 border-2 border-[#862FE0] rounded-t-2xl pointer-events-none flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-[#862FE0] text-white flex items-center justify-center shadow-lg">
                        <Check className="w-5 h-5 stroke-[3]" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Bottom: Name & Emoji */}
                <div className="p-3 bg-[#322a34] border-t border-[#4d4250] flex items-center justify-between">
                  <span className="font-gothic text-base text-white tracking-wide truncate">
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

      {/* Selected Monster Detail Hero Card */}
      <div className="bg-[#373038] border border-[#4d4250] rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#4d4250]">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 border-2 border-[#862FE0] shadow-xl ring-2 ring-[#862FE0]/30">
              <MonsterAvatar
                monster={currentMonster}
                size="fill"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-black text-white bg-[#FB702D] shadow">
                  #{currentMonster.number}
                </span>
                <h2 className="font-gothic text-3xl sm:text-4xl text-white tracking-wide leading-tight">
                  {currentMonster.name}
                </h2>
                <span className="text-2xl">{currentMonster.emoji}</span>
              </div>
              <div className="text-xs text-[#c9bfcc]">
                Total accumulated: <strong className="text-[#FFC341] font-mono text-base font-black">{currentMonster.votes}</strong> votes from{' '}
                <strong className="text-[#88E032] font-mono text-base font-black">{votersList.length}</strong> distinct memberships
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
                className="w-48 px-3.5 py-2.5 bg-[#211c22] border border-[#4d4250] rounded-xl text-xs font-mono text-white placeholder:text-[#8d8091] focus:outline-none focus:ring-2 focus:ring-[#862FE0]"
              />
            </div>
            <button
              type="submit"
              disabled={!/^\d{3,4}$/.test(quickMembership.trim())}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow ${
                /^\d{3,4}$/.test(quickMembership.trim())
                  ? 'bg-[#FB702D] hover:bg-[#fc844a] text-white cursor-pointer shadow-lg shadow-[#FB702D]/30'
                  : 'bg-[#29222a] text-[#716575] border border-[#4d4250] cursor-not-allowed'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Vote</span>
            </button>
          </form>
        </div>

        {errorMsg && (
          <div className="mt-2 text-xs text-[#FB702D] font-semibold bg-[#3c1d25] p-2 rounded-lg border border-[#FB702D]/40">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Filter bar */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-white font-bold flex items-center gap-2">
            <span className="font-gothic text-lg text-[#FFC341]">Voter Memberships List</span>
            <span className="text-[#c9bfcc] font-normal">
              ({filteredVoters.length} {filteredVoters.length === 1 ? 'member' : 'members'})
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#b8adb9] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search table by membership..."
              value={filterMembership}
              onChange={(e) => setFilterMembership(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#211c22] border border-[#4d4250] rounded-xl text-xs text-white placeholder:text-[#8d8091] focus:outline-none focus:ring-1 focus:ring-[#862FE0]"
            />
          </div>
        </div>

        {/* TABLE: Each membership appears ONCE with its vote count */}
        <div className="mt-3 overflow-x-auto border border-[#4d4250] rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#241f26] border-b border-[#4d4250] text-[#c9bfcc]">
                <th className="py-3 px-4 font-bold w-12 text-center">#</th>
                <th className="py-3 px-4 font-bold">Membership</th>
                <th className="py-3 px-4 font-bold text-center">Vote Count</th>
                <th className="py-3 px-4 font-bold text-right">% of Monster</th>
                <th className="py-3 px-4 font-bold text-center w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#493e4c]/70">
              {filteredVoters.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[#c9bfcc] italic">
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
                      className="hover:bg-[#433845] transition-colors"
                    >
                      <td className="py-3 px-4 text-center text-[#c9bfcc] font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 font-mono font-black text-white text-base">
                        {item.membership}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black font-mono bg-[#1f2d15] text-[#88E032] border border-[#88E032]/40 shadow-sm">
                          {item.count} {item.count === 1 ? 'vote' : 'votes'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#FFC341]">
                        {percentOfMonster}%
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Add 1 vote button in Lime Green */}
                          <button
                            onClick={() => onAddVote({ monsterNumber: currentMonster.number, membership: item.membership, count: 1 })}
                            className="p-1.5 rounded-lg bg-[#223117] hover:bg-[#2e431f] text-[#88E032] border border-[#88E032]/40 transition"
                            title={`Add 1 vote to membership ${item.membership}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>

                          {/* Minus 1 vote button in Golden Yellow */}
                          <button
                            onClick={() => onRemoveVote(currentMonster.number, item.membership, 1, false)}
                            className="p-1.5 rounded-lg bg-[#3b2f18] hover:bg-[#504021] text-[#FFC341] border border-[#FFC341]/40 transition"
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
                            className="p-1.5 rounded-lg bg-[#3e1923] hover:bg-[#52212f] text-[#f43f5e] border border-[#f43f5e]/40 transition ml-1"
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
