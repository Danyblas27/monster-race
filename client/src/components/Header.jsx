import React from 'react';
import { Trophy, Wifi, WifiOff, Volume2, VolumeX, Search, Settings, Download } from 'lucide-react';

export default function Header({
  connected,
  clientCount,
  totalVotes,
  soundEnabled,
  setSoundEnabled,
  onOpenSearch,
  onOpenSettings,
  onExport
}) {
  return (
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-purple-500/20 sticky top-0 z-40 px-4 py-3 sm:px-6 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Title and Logo */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 flex items-center justify-center shadow-lg shadow-purple-600/30 text-2xl animate-bounce">
            🏁
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                CARRERA DE MONSTRUOS
              </h1>
              <span className="bg-purple-500/20 text-purple-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-purple-500/30">
                10 Monstruos
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Conteo de Votos en Tiempo Real · Sincronización Multidispositivo
            </p>
          </div>
        </div>

        {/* Status badges & Quick Actions */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {/* Multi-device live status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border ${
            connected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            {connected ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Wifi className="w-3.5 h-3.5" />
                <span>
                  {clientCount} {clientCount === 1 ? 'dispositivo' : 'dispositivos'} en vivo
                </span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 animate-pulse" />
                <span>Desconectado</span>
              </>
            )}
          </div>

          {/* Total Votes Counter */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-500/10 border border-purple-500/30 text-purple-300">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Total: <span className="text-white text-sm">{totalVotes}</span> votos</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl text-xs border transition-all ${
              soundEnabled
                ? 'bg-slate-800 text-purple-400 border-purple-500/30 hover:bg-slate-700'
                : 'bg-slate-800 text-slate-500 border-slate-700 hover:bg-slate-700'
            }`}
            title={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Voter Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow-sm"
            title="Buscar si una membresía ya votó"
          >
            <Search className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Buscar</span> Membresía
          </button>

          {/* Export JSON */}
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Descargar archivo JSON con todos los datos"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">JSON</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Configuración y Reinicio"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
