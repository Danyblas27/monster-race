import React, { useState } from 'react';
import { X, Search, CheckCircle2, AlertCircle, Trash2, Plus, Minus } from 'lucide-react';

export default function MembershipSearchModal({
  isOpen,
  onClose,
  monsters,
  onAddVote,
  onRemoveVote
}) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const trimmed = searchTerm.trim();
  const searchResults = [];
  let totalVotesFound = 0;

  if (trimmed.length >= 3) {
    for (const m of monsters) {
      const voter = m.votesByMembership?.find((v) => v.membership === trimmed);
      if (voter && voter.count > 0) {
        searchResults.push({
          monster: m,
          count: voter.count
        });
        totalVotesFound += voter.count;
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <Search className="w-5 h-5 text-purple-400" />
          <div>
            <h3 className="text-base font-bold text-white">Consultar Membresía</h3>
            <p className="text-xs text-slate-400">
              Verifica los votos de cualquier socio en los 10 monstruos
            </p>
          </div>
        </div>

        {/* Input */}
        <div className="relative mb-4">
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.replace(/\D/g, ''))}
            placeholder="Escribe la membresía (ej. 5555)"
            className="w-full pl-3 pr-8 py-2 bg-slate-950 border border-slate-700 rounded-lg text-base font-mono text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            autoFocus
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results */}
        {trimmed.length < 3 ? (
          <div className="text-center py-6 text-xs text-slate-500 italic">
            Ingresa al menos 3 dígitos numéricos para consultar...
          </div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-2.5">
            <div className="text-xs font-semibold text-emerald-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Membresía #{trimmed} encontrada</span>
              </span>
              <span className="font-mono text-white font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                Total: {totalVotesFound} {totalVotesFound === 1 ? 'voto' : 'votos'}
              </span>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {searchResults.map(({ monster: m, count }) => (
                <div
                  key={m.number}
                  className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{m.emoji}</span>
                    <div>
                      <div className="font-bold text-white">#{m.number} {m.name}</div>
                      <div className="text-slate-400">
                        Tiene <strong className="text-purple-300 font-mono">{count}</strong> {count === 1 ? 'voto' : 'votos'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onAddVote({ monsterNumber: m.number, membership: trimmed, count: 1 })}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                      title="Sumar 1 voto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onRemoveVote(m.number, trimmed, 1, false)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                      title="Restar 1 voto"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`¿Eliminar todos los votos (${count}) de la membresía ${trimmed} en ${m.name}?`)) {
                          onRemoveVote(m.number, trimmed, count, true);
                        }
                      }}
                      className="p-1 rounded bg-rose-950/40 text-rose-400 hover:bg-rose-900/50 border border-rose-800/40 ml-1"
                      title="Eliminar todos los votos en este monstruo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-center space-y-1.5">
            <AlertCircle className="w-6 h-6 text-slate-400 mx-auto" />
            <div className="text-xs font-bold text-white">
              La membresía #{trimmed} no tiene votos registrados
            </div>
            <p className="text-[11px] text-slate-400">
              No aparece en ninguno de los 10 monstruos actualmente.
            </p>
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
