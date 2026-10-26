import React, { useState } from 'react';
import { Users, Trash2, X, Plus, Search, ChevronDown, ChevronUp } from 'lucide-react';

export default function MonsterCards({
  monsters,
  totalVotes,
  onSelectMonster,
  onRemoveVote
}) {
  const [filterMembership, setFilterMembership] = useState('');
  const [expandedMonsters, setExpandedMonsters] = useState({});

  const toggleExpand = (number) => {
    setExpandedMonsters((prev) => ({
      ...prev,
      [number]: !prev[number]
    }));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <span>📋 Detalle de Monstruos y Membresías Votantes</span>
          </h2>
          <p className="text-xs text-slate-400">
            Revisa cada voto registrado por número de membresía y elimina errores si es necesario
          </p>
        </div>

        {/* Filter input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filtrar por membresía..."
            value={filterMembership}
            onChange={(e) => setFilterMembership(e.target.value.trim())}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Grid of 10 Monster Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {monsters.map((monster) => {
          const isExpanded = expandedMonsters[monster.number] ?? true;
          const filteredMemberships = filterMembership
            ? monster.memberships.filter((m) => m.includes(filterMembership))
            : monster.memberships;

          const percent = totalVotes > 0 ? ((monster.votes / totalVotes) * 100).toFixed(1) : 0;

          return (
            <div
              key={monster.number}
              className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-white shadow"
                      style={{ backgroundColor: monster.color }}
                    >
                      #{monster.number}
                    </span>
                    <span className="text-2xl">{monster.emoji}</span>
                    <div className="truncate">
                      <h3 className="font-extrabold text-sm text-white truncate">
                        {monster.name}
                      </h3>
                      <div className="text-[11px] text-slate-400">
                        {percent}% del total
                      </div>
                    </div>
                  </div>

                  {/* Quick Select Button */}
                  <button
                    onClick={() => onSelectMonster(monster.number)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition shrink-0"
                    title={`Seleccionar ${monster.name} para votar`}
                  >
                    <Plus className="w-3 h-3" />
                    Votar
                  </button>
                </div>

                {/* Vote Count Bar */}
                <div className="bg-slate-900 rounded-xl p-2 mb-3 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Votos acumulados:</span>
                  <span
                    className="text-base font-black px-2 py-0.5 rounded-lg"
                    style={{
                      backgroundColor: `${monster.color}22`,
                      color: monster.color
                    }}
                  >
                    {monster.votes}
                  </span>
                </div>

                {/* Membership List Heading */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <div className="flex items-center gap-1 font-semibold text-slate-300">
                    <Users className="w-3.5 h-3.5 text-purple-400" />
                    <span>Membresías ({filteredMemberships.length})</span>
                  </div>
                  <button
                    onClick={() => toggleExpand(monster.number)}
                    className="text-slate-500 hover:text-slate-300"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Memberships Badges Container */}
                {isExpanded && (
                  <div className="min-h-[80px] max-h-48 overflow-y-auto bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                    {filteredMemberships.length === 0 ? (
                      <div className="text-center py-4 text-xs text-slate-500 italic">
                        {filterMembership
                          ? 'Ninguna coincidencia con el filtro'
                          : 'Aún no tiene votos registrados'}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {filteredMemberships.map((mem) => (
                          <span
                            key={mem}
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-mono font-semibold text-slate-200 transition group"
                          >
                            <span>{mem}</span>
                            <button
                              onClick={() => {
                                if (window.confirm(`¿Seguro que deseas eliminar el voto de la membresía ${mem} para el Monstruo #${monster.number} (${monster.name})?`)) {
                                  onRemoveVote(monster.number, mem);
                                }
                              }}
                              className="text-slate-500 hover:text-rose-400 rounded transition"
                              title={`Eliminar voto de ${mem}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
