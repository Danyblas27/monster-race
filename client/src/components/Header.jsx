import React from 'react';
import { Wifi, WifiOff, BarChart3, Users, CheckSquare } from 'lucide-react';

export default function Header({
  connected,
  clientCount,
  activeTab,
  setActiveTab
}) {
  return (
    <header className="bg-[#2a232b] border-b border-[#493e4c] sticky top-0 z-30 px-4 py-2.5 shadow-md">
      {/* Top Halloween accent bar */}
      <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-[#862FE0] via-[#FB702D] to-[#88E032]" />

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand / Logo: ONLY "MONSTER RACE" */}
        <div className="flex items-center">
          <h1 className="font-spooky text-2xl sm:text-3xl text-[#FB702D] tracking-wider leading-none drop-shadow-sm select-none">
            MONSTER RACE
          </h1>
        </div>

        {/* Navigation Tabs in the Navbar */}
        <div className="flex items-center gap-1.5 bg-[#211c22] p-1 rounded-xl border border-[#493e4c]">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'summary'
                ? 'bg-[#862FE0] text-white shadow-md shadow-[#862FE0]/30'
                : 'text-[#c9bfcc] hover:text-white hover:bg-[#373038]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#FFC341]" />
            <span>Global Summary</span>
          </button>

          <button
            onClick={() => setActiveTab('monsters')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'monsters'
                ? 'bg-[#862FE0] text-white shadow-md shadow-[#862FE0]/30'
                : 'text-[#c9bfcc] hover:text-white hover:bg-[#373038]'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#88E032]" />
            <span>Monsters</span>
          </button>

          <button
            onClick={() => setActiveTab('capture')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'capture'
                ? 'bg-[#862FE0] text-white shadow-md shadow-[#862FE0]/30'
                : 'text-[#c9bfcc] hover:text-white hover:bg-[#373038]'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 text-[#FB702D]" />
            <span>Record Votes</span>
          </button>
        </div>

        {/* Sync Status Badge */}
        <div className="flex items-center">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
              connected
                ? 'bg-[#223117] border-[#88E032]/40 text-[#88E032]'
                : 'bg-[#3b1c23] border-[#f43f5e]/40 text-[#f43f5e]'
            }`}
          >
            {connected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#88E032] animate-pulse" />
                <Wifi className="w-3 h-3 text-[#88E032]" />
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
