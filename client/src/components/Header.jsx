import React from 'react';
import { Wifi, WifiOff, BarChart3, Users, CheckSquare } from 'lucide-react';

export default function Header({
  connected,
  clientCount,
  activeTab,
  setActiveTab
}) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 px-4 py-2.5">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🏁</span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">
                Monster Race
              </h1>
              <span className="bg-slate-800 text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-700">
                10 Monsters
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Live Vote Counting System
            </p>
          </div>
        </div>

        {/* Navigation Tabs in the Navbar */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'summary'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Global Summary</span>
          </button>

          <button
            onClick={() => setActiveTab('monsters')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'monsters'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Monsters</span>
          </button>

          <button
            onClick={() => setActiveTab('capture')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'capture'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Record Votes</span>
          </button>
        </div>

        {/* Sync Status Badge */}
        <div className="flex items-center">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
              connected
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400'
                : 'bg-rose-950/40 border-rose-800/60 text-rose-400'
            }`}
          >
            {connected ? (
              <>
                <Wifi className="w-3 h-3" />
                <span>
                  {clientCount} {clientCount === 1 ? 'device online' : 'devices online'}
                </span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                <span>Offline</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
