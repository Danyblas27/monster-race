import React, { useState, useRef, useEffect } from 'react';
import { Send, Hash, CheckCircle, Undo2, Check } from 'lucide-react';
import MonsterAvatar from './MonsterAvatar';

export default function VoteCaptureTab({
  monsters,
  selectedMonster,
  setSelectedMonster,
  onVoteSubmit,
  onRemoveVote,
  recentVotes,
  submitting
}) {
  const [membership, setMembership] = useState('');
  const [feedback, setFeedback] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedMonster]);

  const currentMonsterObj = monsters.find((m) => m.number === selectedMonster) || monsters[0];

  // How many times has this membership already voted for the selected monster?
  const existingVoter = currentMonsterObj?.votesByMembership?.find(
    (v) => v.membership === membership.trim()
  );
  const existingCount = existingVoter?.count || 0;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const mem = membership.trim();
    if (!/^\d{3,4}$/.test(mem)) return;

    // Always 1 vote per paper ballot submission
    const success = await onVoteSubmit({
      monsterNumber: selectedMonster,
      membership: mem,
      count: 1
    });

    if (success) {
      const nextTotal = existingCount + 1;
      setFeedback({
        membership: mem,
        monsterName: currentMonsterObj.name,
        monsterNumber: selectedMonster,
        newTotal: nextTotal
      });
      setMembership('');
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
    }
  };

  return (
    <div className="space-y-6">
      {/* 10 Monster Selection - LARGE CARDS (2 rows of 5 on desktop) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              Step 1: Select Monster from Ballot Paper
            </h2>
            <p className="text-xs text-slate-400">Click on any monster card below</p>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline font-mono">
            Keyboard shortcut: Alt + 1..0
          </span>
        </div>

        {/* 10 Large Monster Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {monsters.map((monster) => {
            const isSelected = monster.number === selectedMonster;
            return (
              <div
                key={monster.number}
                onClick={() => {
                  setSelectedMonster(monster.number);
                  if (inputRef.current) inputRef.current.focus();
                }}
                className={`flex flex-col rounded-2xl overflow-hidden border transition-all duration-200 cursor-pointer group text-left relative ${
                  isSelected
                    ? 'border-purple-500 ring-2 ring-purple-500/80 bg-slate-800 shadow-xl shadow-purple-500/10 scale-[1.02]'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 hover:scale-[1.01]'
                }`}
              >
                {/* Large Card Image Area */}
                <div className="w-full h-40 sm:h-44 relative overflow-hidden bg-slate-950 flex items-center justify-center">
                  <MonsterAvatar
                    monster={monster}
                    size="fill"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Monster Number Badge */}
                  <div className="absolute top-2 left-2 z-10">
                    <span
                      className="px-2 py-0.5 rounded-md text-xs font-black text-white shadow-lg flex items-center gap-1"
                      style={{ backgroundColor: monster.color || '#8b5cf6' }}
                    >
                      #{monster.number}
                    </span>
                  </div>

                  {/* Vote Count Badge */}
                  <div className="absolute top-2 right-2 z-10">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-950/90 text-purple-300 border border-slate-700/80 shadow">
                      {monster.votes} {monster.votes === 1 ? 'vote' : 'votes'}
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
                    {monster.name}
                  </span>
                  <span className="text-base select-none shrink-0 ml-1">
                    {monster.emoji}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ballot Entry Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="mb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Step 2: Enter membership number from ballot
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Target Monster Selected Display */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
              <MonsterAvatar
                monster={currentMonsterObj}
                size="lg"
                className="rounded-xl shadow ring-1 ring-slate-700"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="px-1.5 py-0.5 rounded text-[10px] font-black text-white"
                    style={{ backgroundColor: currentMonsterObj?.color || '#8b5cf6' }}
                  >
                    #{currentMonsterObj?.number}
                  </span>
                  <span className="text-xs uppercase font-bold text-slate-400">
                    Selected Monster
                  </span>
                </div>
                <div className="font-extrabold text-base text-white">
                  {currentMonsterObj?.name}
                </div>
              </div>
            </div>

            {/* Membership input */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Hash className="w-4 h-4" />
              </div>
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={membership}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 4) setMembership(val);
                }}
                placeholder="Enter 3 or 4-digit membership (e.g. 5555)"
                className="w-full pl-10 pr-16 py-3.5 bg-slate-950 border border-slate-700 rounded-xl text-lg font-mono text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
                autoFocus
              />
              <span className="absolute right-3.5 top-3.5 text-xs text-slate-500 font-mono">
                {membership.length}/4
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !/^\d{3,4}$/.test(membership.trim())}
              className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition shrink-0 shadow-lg ${
                /^\d{3,4}$/.test(membership.trim())
                  ? 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer shadow-purple-600/30 active:scale-95'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Count Vote</span>
              <kbd className="hidden sm:inline text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">
                ↵ Enter
              </kbd>
            </button>
          </div>

          {/* Helper when membership is typed */}
          {membership.length >= 3 && /^\d{3,4}$/.test(membership) && (
            <div className="text-xs text-slate-300 bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <span>
                Membership <strong className="text-white font-mono">{membership}</strong>
                {existingCount > 0 ? (
                  <>: currently has <strong className="text-purple-300 font-mono">{existingCount}</strong> {existingCount === 1 ? 'vote' : 'votes'} on this monster. Pressing Enter will record vote #{existingCount + 1}.</>
                ) : (
                  <>: no previous votes for this monster. Press Enter to record their first vote.</>
                )}
              </span>
            </div>
          )}

          {/* Feedback from last added vote */}
          {feedback && (
            <div className="text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 px-3.5 py-2.5 rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Vote counted! Membership <strong>#{feedback.membership}</strong> registered on <strong>#{feedback.monsterNumber} {feedback.monsterName}</strong> (Total votes from this member on this monster: {feedback.newTotal}).
              </span>
            </div>
          )}
        </form>

        {/* Recent votes list with Undo */}
        {recentVotes && recentVotes.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2 overflow-x-auto text-xs">
            <span className="text-slate-400 text-xs shrink-0 font-medium">
              Recent votes entered:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto py-0.5">
              {recentVotes.slice(0, 5).map((rv, idx) => (
                <div
                  key={rv.id || `${rv.membership}-${idx}`}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs shrink-0"
                >
                  <span className="font-bold">#{rv.monsterNumber} {rv.monsterName}</span>
                  <span className="font-mono font-bold text-white bg-slate-900 px-1.5 py-0.5 rounded">
                    {rv.membership}
                  </span>
                  <button
                    onClick={() => onRemoveVote(rv.monsterNumber, rv.membership, 1, false)}
                    className="text-slate-400 hover:text-rose-400 p-0.5 rounded hover:bg-rose-950/30 transition"
                    title="Undo this vote"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
