import React, { useState, useRef, useEffect } from 'react';
import { Send, Hash, CheckCircle, Undo2, Check, Calendar } from 'lucide-react';
import MonsterAvatar from './MonsterAvatar';

export default function VoteCaptureTab({
  monsters,
  selectedMonster,
  setSelectedMonster,
  onVoteSubmit,
  onRemoveVote,
  recentVotes,
  submitting,
  today = '',
  selectedDate = 'all',
  availableDates = []
}) {
  const [membership, setMembership] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [ballotDate, setBallotDate] = useState(() => {
    if (selectedDate && selectedDate !== 'all') return selectedDate;
    return today || new Date().toISOString().split('T')[0];
  });
  const inputRef = useRef(null);

  useEffect(() => {
    if (selectedDate && selectedDate !== 'all') {
      setBallotDate(selectedDate);
    }
  }, [selectedDate]);

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

    // Always 1 vote per paper ballot submission with the selected ballot date
    const success = await onVoteSubmit({
      monsterNumber: selectedMonster,
      membership: mem,
      count: 1,
      date: ballotDate
    });

    if (success) {
      const nextTotal = existingCount + 1;
      setFeedback({
        membership: mem,
        monsterName: currentMonsterObj.name,
        monsterNumber: selectedMonster,
        date: ballotDate,
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
      {/* 10 Monster Selection - LARGE CARDS */}
      <div className="bg-[#373038] border border-[#4d4250] rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#4d4250]">
          <div>
            <h2 className="font-cinzel text-xl sm:text-2xl text-white font-bold tracking-wide">
              Step 1: Select Monster
            </h2>
            <p className="text-xs text-[#c9bfcc]">Click on any monster card below</p>
          </div>
          <span className="text-xs text-[#FFC341] font-mono font-bold bg-[#211c22] px-2.5 py-1 rounded-md border border-[#4d4250] hidden sm:inline">
            Shortcut: Alt + 1..0
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
                    ? 'border-[#862FE0] ring-2 ring-[#862FE0] bg-[#443846] shadow-xl shadow-[#862FE0]/20 scale-[1.02]'
                    : 'bg-[#2b242d] border-[#4d4250] hover:border-[#FB702D]/60 hover:bg-[#3d323e] hover:scale-[1.01]'
                }`}
              >
                {/* Large Card Image Area */}
                <div className="w-full h-40 sm:h-44 relative overflow-hidden bg-[#211c22] flex items-center justify-center">
                  <MonsterAvatar
                    monster={monster}
                    size="fill"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Monster Number Badge */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className="px-2 py-0.5 rounded-md text-xs font-black text-white bg-[#FB702D] shadow-lg flex items-center gap-1">
                      #{monster.number}
                    </span>
                  </div>

                  {/* Vote Count Badge in Lime Green */}
                  <div className="absolute top-2 right-2 z-10">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-[#211c22]/95 text-[#88E032] border border-[#88E032]/40 shadow">
                      {monster.votes} {monster.votes === 1 ? 'vote' : 'votes'}
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

                {/* Card Bottom: Name (Legible Cinzel font, No emojis) */}
                <div className="p-3 bg-[#322a34] border-t border-[#4d4250] flex items-center justify-between">
                  <span className="font-cinzel text-xs sm:text-sm font-bold text-white tracking-wide truncate">
                    {monster.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ballot Entry Form */}
      <div className="bg-[#373038] border border-[#4d4250] rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <span className="font-cinzel text-base sm:text-lg text-[#FFC341] font-bold tracking-wide block">
            Step 2: Enter Membership Number
          </span>
          <div className="flex items-center gap-2 text-xs bg-[#211c22] px-3 py-1.5 rounded-xl border border-[#4d4250]">
            <Calendar className="w-3.5 h-3.5 text-[#FB702D]" />
            <span className="text-[#c9bfcc] font-bold">Ballot Date:</span>
            <input
              type="date"
              value={ballotDate}
              onChange={(e) => setBallotDate(e.target.value)}
              className="bg-[#2a232b] border border-[#4d4250] rounded-lg px-2 py-1 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#FB702D]"
            />
            {ballotDate !== today && today && (
              <button
                type="button"
                onClick={() => setBallotDate(today)}
                className="text-[11px] text-[#88E032] hover:underline font-bold"
              >
                Today
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Target Monster Selected Display */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#211c22] border border-[#4d4250] shrink-0">
              <MonsterAvatar
                monster={currentMonsterObj}
                size="lg"
                className="rounded-xl shadow ring-1 ring-[#862FE0]/50"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black text-white bg-[#FB702D]">
                    #{currentMonsterObj?.number}
                  </span>
                  <span className="text-[11px] uppercase font-bold text-[#c9bfcc]">
                    Selected Monster
                  </span>
                </div>
                <div className="font-cinzel text-lg sm:text-xl font-bold text-white tracking-wide">
                  {currentMonsterObj?.name}
                </div>
              </div>
            </div>

            {/* Membership input */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#b8adb9]">
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
                className="w-full pl-10 pr-16 py-3.5 bg-[#211c22] border border-[#4d4250] rounded-xl text-lg font-mono font-bold text-white placeholder:text-[#8d8091] focus:outline-none focus:ring-2 focus:ring-[#862FE0] shadow-inner"
                autoFocus
              />
              <span className="absolute right-3.5 top-3.5 text-xs text-[#b8adb9] font-mono">
                {membership.length}/4
              </span>
            </div>

            {/* Submit Button in Intense Halloween Orange */}
            <button
              type="submit"
              disabled={submitting || !/^\d{3,4}$/.test(membership.trim())}
              className={`flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-black text-sm transition shrink-0 shadow-lg ${
                /^\d{3,4}$/.test(membership.trim())
                  ? 'bg-[#FB702D] hover:bg-[#fc844a] text-white cursor-pointer shadow-[#FB702D]/30 active:scale-95'
                  : 'bg-[#29222a] text-[#716575] border border-[#4d4250] cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Count Vote</span>
              <kbd className="hidden sm:inline text-[10px] bg-[#211c22] px-1.5 py-0.5 rounded text-white border border-[#4d4250]">
                ↵ Enter
              </kbd>
            </button>
          </div>

          {/* Helper when membership is typed */}
          {membership.length >= 3 && /^\d{3,4}$/.test(membership) && (
            <div className="text-xs text-[#c9bfcc] bg-[#211c22] px-4 py-2.5 rounded-xl border border-[#4d4250] flex items-center justify-between">
              <span>
                Membership <strong className="text-[#FFC341] font-mono text-sm font-bold">#{membership}</strong>
                {existingCount > 0 ? (
                  <>: currently has <strong className="text-[#88E032] font-mono font-bold">{existingCount}</strong> {existingCount === 1 ? 'vote' : 'votes'} on this monster. Pressing Enter will record vote #{existingCount + 1}.</>
                ) : (
                  <>: no previous votes for this monster. Press Enter to record their first vote.</>
                )}
              </span>
            </div>
          )}

          {/* Feedback from last added vote */}
          {feedback && (
            <div className="text-xs text-[#88E032] bg-[#1d2b15] border border-[#88E032]/40 px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium">
              <CheckCircle className="w-4 h-4 text-[#88E032] shrink-0" />
              <span>
                Vote counted! Membership <strong className="font-mono text-white">#{feedback.membership}</strong> registered on <strong className="text-white">#{feedback.monsterNumber} {feedback.monsterName}</strong> (Total votes from this member: <strong className="font-mono text-white">{feedback.newTotal}</strong>).
              </span>
            </div>
          )}
        </form>

        {/* Recent votes list with Undo */}
        {recentVotes && recentVotes.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-[#4d4250] flex items-center justify-between gap-2 overflow-x-auto text-xs">
            <span className="text-[#c9bfcc] text-xs shrink-0 font-bold uppercase tracking-wider">
              Recent Votes:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto py-0.5">
              {recentVotes.slice(0, 5).map((rv, idx) => (
                <div
                  key={rv.id || `${rv.membership}-${idx}`}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#211c22] border border-[#4d4250] text-[#e2dbe6] text-xs shrink-0"
                >
                  <span className="font-cinzel text-xs font-bold text-[#FFC341]">#{rv.monsterNumber} {rv.monsterName}</span>
                  <span className="font-mono font-black text-white bg-[#373038] px-1.5 py-0.5 rounded border border-[#4d4250]">
                    {rv.membership}
                  </span>
                  <button
                    onClick={() => onRemoveVote(rv.monsterNumber, rv.membership, 1, false)}
                    className="text-[#b8adb9] hover:text-[#f43f5e] p-0.5 rounded transition"
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
