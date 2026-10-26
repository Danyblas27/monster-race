import React, { useState, useEffect, useRef } from 'react';
import { Send, AlertTriangle, CheckCircle, ArrowRightLeft, Sparkles, Undo2, Hash } from 'lucide-react';

export default function VoteForm({
  monsters,
  selectedMonster,
  setSelectedMonster,
  onVoteSubmit,
  onRemoveVote,
  recentVotes,
  submitting
}) {
  const [membership, setMembership] = useState('');
  const [allowTransfer, setAllowTransfer] = useState(false);
  const [validationStatus, setValidationStatus] = useState(null); // null | 'ok' | 'duplicate_same' | 'duplicate_other'
  const [otherMonster, setOtherMonster] = useState(null);
  const inputRef = useRef(null);

  // Focus input automatically
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedMonster]);

  // Keyboard shortcut for selecting monsters: 1-9 -> monsters 1-9, 0 -> monster 10
  // (Only if not typing in the membership input or with alt/ctrl, but let's allow it when input is empty!)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // If user is focused on membership and typing digits, don't hijack monster selection unless Alt key is pressed
      if (document.activeElement === inputRef.current && membership.length > 0) {
        return;
      }
      if (e.key >= '1' && e.key <= '9' && (e.altKey || document.activeElement !== inputRef.current)) {
        e.preventDefault();
        const num = parseInt(e.key, 10);
        setSelectedMonster(num);
        if (inputRef.current) inputRef.current.focus();
      } else if (e.key === '0' && (e.altKey || document.activeElement !== inputRef.current)) {
        e.preventDefault();
        setSelectedMonster(10);
        if (inputRef.current) inputRef.current.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [membership, setSelectedMonster]);

  // Live validation when membership changes or selectedMonster changes
  useEffect(() => {
    const mem = membership.trim();
    setAllowTransfer(false);

    if (mem.length < 3) {
      setValidationStatus(null);
      setOtherMonster(null);
      return;
    }

    if (!/^\d{3,4}$/.test(mem)) {
      setValidationStatus('invalid');
      setOtherMonster(null);
      return;
    }

    // Check current monster
    const currentM = monsters.find((m) => m.number === selectedMonster);
    if (currentM && currentM.memberships.includes(mem)) {
      setValidationStatus('duplicate_same');
      setOtherMonster(currentM);
      return;
    }

    // Check other monsters
    const otherM = monsters.find((m) => m.number !== selectedMonster && m.memberships.includes(mem));
    if (otherM) {
      setValidationStatus('duplicate_other');
      setOtherMonster(otherM);
      return;
    }

    setValidationStatus('ok');
    setOtherMonster(null);
  }, [membership, selectedMonster, monsters]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const mem = membership.trim();

    if (!/^\d{3,4}$/.test(mem)) {
      return;
    }

    if (validationStatus === 'duplicate_same') {
      return;
    }

    const success = await onVoteSubmit({
      monsterNumber: selectedMonster,
      membership: mem,
      allowTransfer: allowTransfer || validationStatus === 'duplicate_other'
    });

    if (success) {
      setMembership('');
      setAllowTransfer(false);
      setValidationStatus(null);
      // Re-focus input for next paper ballot
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
    }
  };

  const currentMonsterObj = monsters.find((m) => m.number === selectedMonster);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div
        className="absolute -top-24 -right-24 w-60 h-60 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500"
        style={{ backgroundColor: currentMonsterObj?.color || '#a855f7' }}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <span>🗳️ Registro Rápido de Votos</span>
            <span className="text-xs bg-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
              Captura Manual
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            1. Selecciona el monstruo del papel &bull; 2. Escribe la membresía (3 o 4 dígitos) &bull; 3. Presiona Enter
          </p>
        </div>
        <div className="text-xs text-slate-400 hidden lg:block">
          💡 Atajo: presiona <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">Alt + 1..0</kbd> para elegir monstruo
        </div>
      </div>

      {/* 10 Monster Selection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-10 gap-2 mb-5">
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
              style={{
                borderColor: isSelected ? monster.color : undefined,
                boxShadow: isSelected ? `0 0 15px ${monster.color}44` : undefined
              }}
              className={`flex flex-col items-center justify-between p-2.5 rounded-2xl border transition-all text-center relative group ${
                isSelected
                  ? 'bg-slate-800/90 ring-2 ring-offset-2 ring-offset-slate-900 font-bold scale-[1.02]'
                  : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              {/* Badge Number */}
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black mb-1 shadow"
                style={{
                  backgroundColor: monster.color,
                  color: '#ffffff'
                }}
              >
                {monster.number}
              </div>

              {/* Emoji */}
              <span className="text-2xl my-0.5 transform group-hover:scale-110 transition-transform">
                {monster.emoji}
              </span>

              {/* Monster Name */}
              <span className="text-[11px] font-semibold text-slate-200 truncate w-full px-1">
                {monster.name}
              </span>

              {/* Vote count */}
              <span
                className="text-xs font-black mt-1 px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${monster.color}22`,
                  color: monster.color
                }}
              >
                {monster.votes} {monster.votes === 1 ? 'voto' : 'votos'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Input & Submit Area */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            {/* Target Monster indicator */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 min-w-[240px]">
              <span className="text-3xl">{currentMonsterObj?.emoji}</span>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Monstruo Seleccionado #{currentMonsterObj?.number}
                </div>
                <div className="font-extrabold text-sm sm:text-base text-white truncate" style={{ color: currentMonsterObj?.color }}>
                  {currentMonsterObj?.name}
                </div>
              </div>
            </div>

            {/* Membership input */}
            <div className="flex-1 relative">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Hash className="w-5 h-5" />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={membership}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 4) setMembership(val);
                  }}
                  placeholder="Número de membresía (3-4 dígitos, ej. 5555)"
                  className="w-full pl-11 pr-24 py-3 bg-slate-900 border border-slate-700 rounded-xl text-lg sm:text-xl font-mono tracking-widest text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition shadow-inner"
                  autoFocus
                />
                <span className="absolute right-3.5 top-3.5 text-xs text-slate-500 font-mono">
                  {membership.length}/4
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                submitting ||
                !/^\d{3,4}$/.test(membership) ||
                validationStatus === 'duplicate_same' ||
                (validationStatus === 'duplicate_other' && !allowTransfer)
              }
              className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all shadow-lg active:scale-95 ${
                /^\d{3,4}$/.test(membership) &&
                validationStatus !== 'duplicate_same' &&
                (validationStatus !== 'duplicate_other' || allowTransfer)
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-purple-600/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>{allowTransfer ? 'Transferir Voto' : 'Contar Voto'}</span>
              <kbd className="hidden sm:inline text-[10px] bg-black/30 px-1.5 py-0.5 rounded border border-white/20">
                ↵ Enter
              </kbd>
            </button>
          </div>

          {/* Validation Feedback Messages */}
          {validationStatus === 'duplicate_same' && (
            <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs sm:text-sm animate-shake">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>
                <strong>¡Voto duplicado!</strong> La membresía <code className="font-mono bg-rose-950/60 px-1 py-0.5 rounded text-white font-bold">{membership}</code> ya votó previamente por el <strong>Monstruo #{selectedMonster} ({otherMonster?.name})</strong>. No se puede repetir la misma membresía.
              </span>
            </div>
          )}

          {validationStatus === 'duplicate_other' && (
            <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-300 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400" />
                <span>
                  <strong>Atención:</strong> La membresía <code className="font-mono bg-amber-950/60 px-1 py-0.5 rounded text-white font-bold">{membership}</code> ya votó por el <strong>Monstruo #{otherMonster?.number} ({otherMonster?.name})</strong>.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAllowTransfer(true);
                  // Automatically submit transfer if user clicks this
                  handleSubmit();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400 transition text-xs shrink-0"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                Transferir voto a este monstruo
              </button>
            </div>
          )}

          {validationStatus === 'ok' && (
            <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Membresía <span className="font-mono font-bold">{membership}</span> lista para registrarse en el Monstruo #{selectedMonster}.</span>
            </div>
          )}
        </div>
      </form>

      {/* Recent Votes ticker directly below form for quick undo */}
      {recentVotes && recentVotes.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto text-xs">
          <div className="flex items-center gap-2 text-slate-400 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-semibold text-slate-300">Últimos votos ingresados:</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {recentVotes.slice(0, 4).map((rv, idx) => (
              <div
                key={rv.id || `${rv.membership}-${idx}`}
                className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700/80 text-slate-300 text-xs shrink-0"
              >
                <span>{rv.monsterEmoji || '👾'} #{rv.monsterNumber}</span>
                <span className="font-mono font-bold text-white bg-slate-900 px-1.5 py-0.5 rounded">
                  {rv.membership}
                </span>
                <button
                  onClick={() => onRemoveVote(rv.monsterNumber, rv.membership)}
                  className="text-rose-400 hover:text-rose-300 p-0.5 rounded hover:bg-rose-950/40"
                  title="Deshacer / Eliminar voto si hubo error en el papel"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
