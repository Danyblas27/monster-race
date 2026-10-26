import React, { useState, useEffect } from 'react';
import { socket } from './socket';
import Header from './components/Header';
import VoteForm from './components/VoteForm';
import RaceTrack from './components/RaceTrack';
import MonsterCards from './components/MonsterCards';
import MembershipSearchModal from './components/MembershipSearchModal';
import SettingsModal from './components/SettingsModal';
import { playSuccessSound, playErrorSound, playCelebrationFanfare } from './utils/sound';
import { LayoutGrid, Gauge, ListFilter, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [monsters, setMonsters] = useState([]);
  const [connected, setConnected] = useState(false);
  const [clientCount, setClientCount] = useState(1);
  const [selectedMonster, setSelectedMonster] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [recentVotes, setRecentVotes] = useState([]);
  const [notification, setNotification] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Modals
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // View Mode: 'all' | 'race' | 'cards'
  const [viewMode, setViewMode] = useState('all');

  // Load initial data and setup socket listeners
  useEffect(() => {
    // Check initial connection
    if (socket.connected) {
      setConnected(true);
    }

    const onConnect = () => {
      setConnected(true);
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    const onInit = (data) => {
      if (data?.monsters) {
        setMonsters(data.monsters);
      }
      if (data?.clientCount) {
        setClientCount(data.clientCount);
      }
    };

    const onClientsUpdate = (data) => {
      if (data?.count !== undefined) {
        setClientCount(data.count);
      }
    };

    const onMonstersUpdated = (payload) => {
      if (payload?.monsters) {
        setMonsters(payload.monsters);
      }

      // Show notification and sound
      if (payload.event === 'vote_added' && payload.vote) {
        const v = payload.vote;
        const targetM = payload.monsters.find(m => m.number === v.monsterNumber);
        
        // Add to recent votes
        setRecentVotes(prev => [
          {
            id: Date.now() + Math.random(),
            monsterNumber: v.monsterNumber,
            monsterName: v.monsterName || targetM?.name,
            monsterEmoji: targetM?.emoji,
            membership: v.membership,
            timestamp: v.timestamp
          },
          ...prev.slice(0, 9)
        ]);

        showToast({
          type: 'success',
          title: `¡Voto registrado!`,
          message: `Membresía #${v.membership} votó por ${targetM?.emoji || ''} #${v.monsterNumber} ${v.monsterName || targetM?.name}`
        });

        if (soundEnabled) {
          playSuccessSound();
        }
      } else if (payload.event === 'vote_removed' && payload.removed) {
        const r = payload.removed;
        showToast({
          type: 'info',
          title: 'Voto eliminado',
          message: `Se anuló el voto de la membresía #${r.membership} para el Monstruo #${r.monsterNumber}`
        });
      } else if (payload.event === 'reset') {
        showToast({
          type: 'warning',
          title: 'Carrera Reiniciada',
          message: 'Todos los votos han sido reiniciados a cero.'
        });
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('monsters:init', onInit);
    socket.on('stats:clients', onClientsUpdate);
    socket.on('monsters:updated', onMonstersUpdated);

    // Fallback initial REST fetch
    fetch('/api/monsters')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.monsters) {
          setMonsters(data.monsters);
        }
      })
      .catch((err) => console.debug('Initial fetch:', err));

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('monsters:init', onInit);
      socket.off('stats:clients', onClientsUpdate);
      socket.off('monsters:updated', onMonstersUpdated);
    };
  }, [soundEnabled]);

  const showToast = ({ type, title, message }) => {
    setNotification({ type, title, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  // Submit Vote
  const handleVoteSubmit = async ({ monsterNumber, membership, allowTransfer }) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monsterNumber,
          membership,
          allowTransfer,
          deviceId: `Dispositivo ${Math.floor(Math.random() * 1000)}`
        })
      });

      const data = await res.json();
      if (!data.success) {
        showToast({
          type: 'error',
          title: 'Error al registrar',
          message: data.message
        });
        if (soundEnabled) playErrorSound();
        return false;
      }
      return true;
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Error de red',
        message: err.message
      });
      if (soundEnabled) playErrorSound();
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // Remove Vote
  const handleRemoveVote = async (monsterNumber, membership) => {
    try {
      const res = await fetch('/api/vote', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monsterNumber, membership })
      });
      const data = await res.json();
      if (!data.success) {
        showToast({
          type: 'error',
          title: 'Error al eliminar',
          message: data.message
        });
      }
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Error de red',
        message: err.message
      });
    }
  };

  // Reset all votes
  const handleResetVotes = async () => {
    try {
      await fetch('/api/reset', { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
  };

  // Restore defaults
  const handleRestoreDefaults = async () => {
    try {
      await fetch('/api/restore-defaults', { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
  };

  // Update monster
  const handleUpdateMonster = async (number, updates) => {
    try {
      await fetch(`/api/monsters/${number}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Export JSON file
  const handleExport = () => {
    window.location.href = '/api/export';
  };

  // Import JSON data
  const handleImport = async (importedMonsters) => {
    const res = await fetch('/api/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monsters: importedMonsters })
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message);
    }
  };

  const totalVotes = monsters.reduce((acc, m) => acc + (m.votes || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 max-w-sm w-full p-4 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl animate-bounce-short">
          <div className="flex items-start gap-3">
            {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {notification.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {notification.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
            {notification.type === 'info' && <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />}
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white">{notification.title}</h4>
              <p className="text-xs text-slate-300 mt-0.5">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-500 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Top Header */}
      <Header
        connected={connected}
        clientCount={clientCount}
        totalVotes={totalVotes}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onExport={handleExport}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Navigation Tabs (All, Track, Detail Cards) */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-2">
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-2xl">
            <button
              onClick={() => setViewMode('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                viewMode === 'all'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Vista Completa</span>
            </button>
            <button
              onClick={() => setViewMode('race')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                viewMode === 'race'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>Pista de Carrera</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                viewMode === 'cards'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Lista de Membresías</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Persistencia en JSON activa (<code className="text-purple-300">data/monsters.json</code>)</span>
          </div>
        </div>

        {/* 1. Fast Ballot Entry Form (Always prominent) */}
        <VoteForm
          monsters={monsters}
          selectedMonster={selectedMonster}
          setSelectedMonster={setSelectedMonster}
          onVoteSubmit={handleVoteSubmit}
          onRemoveVote={handleRemoveVote}
          recentVotes={recentVotes}
          submitting={submitting}
        />

        {/* 2. Race Track Visualizer */}
        {(viewMode === 'all' || viewMode === 'race') && (
          <RaceTrack
            monsters={monsters}
            totalVotes={totalVotes}
            onTriggerConfetti={() => soundEnabled && playCelebrationFanfare()}
          />
        )}

        {/* 3. Detailed Monster Cards with Membership Pills */}
        {(viewMode === 'all' || viewMode === 'cards') && (
          <MonsterCards
            monsters={monsters}
            totalVotes={totalVotes}
            onSelectMonster={(num) => {
              setSelectedMonster(num);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onRemoveVote={handleRemoveVote}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 px-4 py-4 text-center text-xs text-slate-500">
        Carrera de Monstruos &bull; Sistema de Conteo de Votos en Tiempo Real con React, Vite, Node.js y Docker
      </footer>

      {/* Modals */}
      <MembershipSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        monsters={monsters}
        onRemoveVote={handleRemoveVote}
        onSelectMonsterForVote={(num) => {
          setSelectedMonster(num);
          setSearchOpen(false);
        }}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        monsters={monsters}
        onResetVotes={handleResetVotes}
        onRestoreDefaults={handleRestoreDefaults}
        onUpdateMonster={handleUpdateMonster}
        onExport={handleExport}
        onImport={handleImport}
      />
    </div>
  );
}
