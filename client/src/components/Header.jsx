import React from 'react';
import { Wifi, WifiOff, Search, Settings, Download } from 'lucide-react';

export default function Header({
  connected,
  clientCount,
  totalVotes,
  onOpenSearch,
  onOpenSettings,
  onExport
}) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 px-4 py-3">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Title */}
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🏁</span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                Carrera de Monstruos
              </h1>
              <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded border border-slate-700">
                10 Monstruos
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Conteo de Votos &bull; Sincronización en tiempo real
            </p>
          </div>
        </div>

        {/* Status badges & Actions */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Multi-device sync indicator */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
              connected
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400'
                : 'bg-rose-950/40 border-rose-800/60 text-rose-400'
            }`}
          >
            {connected ? (
              <>
                <Wifi className="w-3.5 h-3.5" />
                <span>{clientCount} {clientCount === 1 ? 'dispositivo conectado' : 'dispositivos conectados'}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span>Desconectado</span>
              </>
            )}
          </div>

          {/* Total Votes */}
          <div className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-200">
            Total: <span className="text-white font-bold">{totalVotes}</span> votos
          </div>

          {/* Search */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Buscar si una membresía ya votó"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Buscar</span>
          </button>

          {/* Export JSON */}
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Descargar archivo JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>JSON</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Ajustes y Reinicio"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
