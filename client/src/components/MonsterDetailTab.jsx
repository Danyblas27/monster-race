import React, { useState } from 'react';
import { Search, Plus, Minus, Trash2, UserPlus, Hash } from 'lucide-react';

export default function MonsterDetailTab({
  monsters,
  selectedMonsterNumber,
  onSelectMonster,
  onAddVote,
  onRemoveVote
}) {
  const [filterMembership, setFilterMembership] = useState('');
  const [quickMembership, setQuickMembership] = useState('');
  const [quickCount, setQuickCount] = useState(1);
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
      setErrorMsg('La membresía debe tener 3 o 4 dígitos numéricos.');
      return;
    }

    const success = await onAddVote({
      monsterNumber: currentMonster.number,
      membership: mem,
      count: quickCount || 1
    });

    if (success) {
      setQuickMembership('');
      setQuickCount(1);
    }
  };

  return (
    <div className="space-y-5">
      {/* Monster Selector Buttons (1 to 10) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
        <div className="text-xs text-slate-400 font-medium mb-2">Selecciona un monstruo:</div>
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-1.5">
          {monsters.map((m) => {
            const isSelected = m.number === currentMonster.number;
            return (
              <button
                key={m.number}
                type="button"
                onClick={() => onSelectMonster(m.number)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition ${
                  isSelected
                    ? 'bg-slate-800 border-purple-500 text-white font-bold ring-1 ring-purple-500'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1 text-xs">
                  <span>{m.emoji}</span>
                  <span>#{m.number}</span>
                </div>
                <span className="text-[11px] truncate w-full text-slate-200 mt-0.5">
                  {m.name}
                </span>
                <span className="text-[10px] font-mono font-semibold text-slate-400 mt-1">
                  {m.votes} {m.votes === 1 ? 'voto' : 'votos'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Monster Detail Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{currentMonster.emoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  Monstruo #{currentMonster.number}
                </span>
                <h2 className="text-lg font-bold text-white">
                  {currentMonster.name}
                </h2>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Total acumulado: <strong className="text-white font-mono">{currentMonster.votes}</strong> votos de{' '}
                <strong className="text-white font-mono">{votersList.length}</strong> membresías distintas
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
                placeholder="Membresía (3-4 dígitos)"
                className="w-48 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <button
              type="submit"
              disabled={!/^\d{3,4}$/.test(quickMembership.trim())}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                /^\d{3,4}$/.test(quickMembership.trim())
                  ? 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sumar Voto</span>
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
            <span>Listado de Membresías Votantes</span>
            <span className="text-slate-500 font-normal">
              ({filteredVoters.length} {filteredVoters.length === 1 ? 'registro' : 'registros'})
            </span>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Buscar en la tabla..."
              value={filterMembership}
              onChange={(e) => setFilterMembership(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* TABLE: Each membership appears ONCE with its vote count */}
        <div className="mt-3 overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3 font-semibold w-12 text-center">#</th>
                <th className="py-2.5 px-4 font-semibold">Membresía</th>
                <th className="py-2.5 px-4 font-semibold text-center">Cantidad de Votos</th>
                <th className="py-2.5 px-4 font-semibold text-right">% del Monstruo</th>
                <th className="py-2.5 px-4 font-semibold text-center w-36">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredVoters.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                    {filterMembership
                      ? 'No hay coincidencias con la búsqueda de membresía.'
                      : 'Este monstruo aún no tiene votos registrados.'}
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
                      <td className="py-2.5 px-3 text-center text-slate-500 font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold text-white text-sm">
                        {item.membership}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {item.count} {item.count === 1 ? 'voto' : 'votos'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-300">
                        {percentOfMonster}%
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          {/* Add 1 vote button */}
                          <button
                            onClick={() => onAddVote({ monsterNumber: currentMonster.number, membership: item.membership, count: 1 })}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                            title={`Sumar 1 voto a la membresía ${item.membership}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>

                          {/* Minus 1 vote button */}
                          <button
                            onClick={() => onRemoveVote(currentMonster.number, item.membership, 1, false)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                            title={`Restar 1 voto a la membresía ${item.membership}`}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete all votes button */}
                          <button
                            onClick={() => {
                              if (window.confirm(`¿Seguro que deseas anular todos los votos (${item.count}) de la membresía ${item.membership} para ${currentMonster.name}?`)) {
                                onRemoveVote(currentMonster.number, item.membership, item.count, true);
                              }
                            }}
                            className="p-1 rounded bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 border border-rose-800/40 transition ml-1"
                            title={`Eliminar todos los votos de la membresía ${item.membership}`}
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
