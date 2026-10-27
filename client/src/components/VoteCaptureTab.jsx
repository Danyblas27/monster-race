import React, { useState, useRef, useEffect } from 'react';
import { Send, Hash, CheckCircle, Undo2 } from 'lucide-react';
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
  const [count, setCount] = useState(1);
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

    const voteCount = Math.max(1, parseInt(count, 10) || 1);
    const success = await onVoteSubmit({
      monsterNumber: selectedMonster,
      membership: mem,
      count: voteCount
    });

    if (success) {
      setFeedback({
        membership: mem,
        monsterName: currentMonsterObj.name,
        monsterEmoji: currentMonsterObj.emoji,
        monsterNumber: selectedMonster,
        count: voteCount,
        newTotal: existingCount + voteCount
      });
      setMembership('');
      setCount(1);
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
    }
  };

  return (
    <div className="space-y-4">
      {/* 10 Monster Selection Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
        <div className="text-xs text-slate-400 font-medium mb-2 flex items-center justify-between">
          <span>Step 1: Select monster from ballot paper</span>
          <span className="text-[11px] text-slate-500">Shortcut: Alt + 1..0</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-1.5">
          {monsters.map((monster) => {
            const isSelected = monster.number === selectedMonster;
            return (
              <button
                key={monster.number}
                type="button"
                onClick={() => {
                  setSelectedMonster(monster.number);
                  if (inputRef.current) inputRef.current.focus();
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition ${
                  isSelected
                    ? 'bg-slate-800 border-purple-500 text-white font-bold ring-1 ring-purple-500'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <MonsterAvatar monster={monster} size="sm" />
                </div>
                <span className="text-[11px] font-semibold truncate w-full text-slate-200">
                  #{monster.number} {monster.name}
                </span>
                <span className="text-[10px] font-mono font-semibold text-slate-400 mt-0.5">
                  {monster.votes} {monster.votes === 1 ? 'vote' : 'votes'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ballot Entry Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5">
        <div className="mb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Step 2: Enter membership number from ballot
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Target Monster Badge */}
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
              <MonsterAvatar monster={currentMonsterObj} size="md" />
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">
                  Monster #{currentMonsterObj?.number}
                </div>
                <div className="font-bold text-sm text-white">
                  {currentMonsterObj?.name}
                </div>
              </div>
            </div>

            {/* Membership input */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
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
                placeholder="Membership number (3-4 digits)"
                className="w-full pl-9 pr-16 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-base font-mono text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                autoFocus
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">
                {membership.length}/4
              </span>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 shrink-0">
              <span className="text-xs text-slate-400">Qty:</span>
              <input
                type="number"
                min="1"
                max="50"
                value={count}
                onChange={(e) => setCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-12 bg-transparent text-center font-mono font-bold text-white text-xs focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !/^\d{3,4}$/.test(membership.trim())}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition shrink-0 ${
                /^\d{3,4}$/.test(membership.trim())
                  ? 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Count Vote</span>
              <kbd className="hidden sm:inline text-[10px] bg-slate-900 px-1 py-0.5 rounded text-slate-400 border border-slate-700">
                ↵ Enter
              </kbd>
            </button>
          </div>

          {/* Existing voter status message */}
          {membership.length >= 3 && /^\d{3,4}$/.test(membership) && (
            <div className="text-xs text-slate-300 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 flex items-center justify-between">
              <span>
                Membership <strong className="text-white font-mono">{membership}</strong>
                {existingCount > 0 ? (
                  <>: already has <strong className="text-purple-300 font-mono">{existingCount}</strong> {existingCount === 1 ? 'vote registered' : 'votes registered'} for this monster. Another vote will be added upon pressing Enter.</>
                ) : (
                  <>: no previous votes for this monster. First vote will be registered.</>
                )}
              </span>
            </div>
          )}

          {/* Feedback from last added vote */}
          {feedback && (
            <div className="text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 px-3 py-2 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Vote counted! Membership <strong>#{feedback.membership}</strong> added {feedback.count} {feedback.count === 1 ? 'vote' : 'votes'} to <strong>{feedback.monsterEmoji} #{feedback.monsterNumber} {feedback.monsterName}</strong> (member total on this monster: {feedback.newTotal}).
              </span>
            </div>
          )}
        </form>

        {/* Recent votes list */}
        {recentVotes && recentVotes.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2 overflow-x-auto text-xs">
            <span className="text-slate-400 text-xs shrink-0 font-medium">
              Recent votes entered:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              {recentVotes.slice(0, 5).map((rv, idx) => (
                <div
                  key={rv.id || `${rv.membership}-${idx}`}
                  className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 text-xs shrink-0"
                >
                  <span>{rv.monsterEmoji} #{rv.monsterNumber}</span>
                  <span className="font-mono font-bold text-white">{rv.membership}</span>
                  <button
                    onClick={() => onRemoveVote(rv.monsterNumber, rv.membership, 1, false)}
                    className="text-slate-400 hover:text-rose-400 p-0.5"
                    title="Undo this vote"
                  >
                    <Undo2 className="w-3 h-3" />
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
