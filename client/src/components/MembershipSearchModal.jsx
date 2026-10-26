import React, { useState } from 'react';
import { X, Search, CheckCircle2, AlertCircle, Trash2, ArrowRight } from 'lucide-react';

export default function MembershipSearchModal({
  isOpen,
  onClose,
  monsters,
  onRemoveVote,
  onSelectMonsterForVote
}) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const trimmed = searchTerm.trim();
  const searchResults = [];

  if (trimmed.length >= 3) {
    for (const m of monsters) {
      if (m.memberships.includes(trimmed)) {
        searchResults.push(m);
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Consultar Membresía</h3>
            <p className="text-xs text-slate-400">
              Verifica al instante el estado de cualquier votante (3 o 4 dígitos)
            </p>
          </div>
        </div>

        {/* Input */}
        <div className="relative mb-5">
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.replace(/\D/g, ''))}
            placeholder="Escribe la membresía (ej. 5555)"
            className="w-full pl-4 pr-10 py-3 bg-slate-950 border border-slate-700 rounded-xl text-lg font-mono text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
            autoFocus
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results */}
        {trimmed.length < 3 ? (
          <div className="text-center py-6 text-xs text-slate-500 italic">
            Ingresa al menos 3 dígitos para buscar...
          </div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Voto Encontrado para la Membresía #{trimmed}</span>
            </div>

            {searchResults.map((m) => (
              <div
                key={m.number}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{m.emoji}</span>
                  <div>
                    <div className="text-xs text-slate-400">Votó por el Monstruo #{m.number}</div>
                    <div className="font-extrabold text-white text-base">{m.name}</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (window.confirm(`¿Eliminar el voto de la membresía ${trimmed} para ${m.name}?`)) {
                      onRemoveVote(m.number, trimmed);
                      onClose();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Eliminar Voto
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
            <div className="text-sm font-bold text-white">
              La membresía #{trimmed} no ha votado aún
            </div>
            <p className="text-xs text-slate-400">
              No se encontró ningún registro en los 10 monstruos. Puedes asignarle un voto en la pantalla principal.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
