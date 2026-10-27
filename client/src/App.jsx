import React, { useState, useEffect } from 'react';
import { socket } from './socket';
import Header from './components/Header';
import GlobalSummary from './components/GlobalSummary';
import MonsterDetailTab from './components/MonsterDetailTab';
import VoteCaptureTab from './components/VoteCaptureTab';
import MembershipSearchModal from './components/MembershipSearchModal';
import SettingsModal from './components/SettingsModal';
import { BarChart3, Users, CheckSquare, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [monsters, setMonsters] = useState([]);
  const [connected, setConnected] = useState(false);
  const [clientCount, setClientCount] = useState(1);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'monsters' | 'capture'
  const [selectedMonsterNumber, setSelectedMonsterNumber] = useState(1);
  const [recentVotes, setRecentVotes] = useState([]);
  const [notification, setNotification] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Modals
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (socket.connected) {
      setConnected(true);
    }

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    const onInit = (data) => {
      if (data?.monsters) setMonsters(data.monsters);
      if (data?.clientCount) setClientCount(data.clientCount);
    };

    const onClientsUpdate = (data) => {
      if (data?.count !== undefined) setClientCount(data.count);
    };

    const onMonstersUpdated = (payload) => {
      if (payload?.monsters) {
        setMonsters(payload.monsters);
      }

      if (payload.event === 'vote_added' && payload.vote) {
        const v = payload.vote;
        const targetM = payload.monsters.find((m) => m.number === v.monsterNumber);

        setRecentVotes((prev) => [
          {
            id: Date.now() + Math.random(),
            monsterNumber: v.monsterNumber,
            monsterName: v.monsterName || targetM?.name,
            monsterEmoji: targetM?.emoji,
            membership: v.membership,
            addedCount: v.addedCount || 1,
            timestamp: v.timestamp
          },
          ...prev.slice(0, 9)
        ]);

        showNotification({
          type: 'success',
          text: `Voto registrado: Membresía #${v.membership} sumó ${v.addedCount || 1} voto(s) para #${v.monsterNumber} ${targetM?.name || ''}`
        });
      } else if (payload.event === 'vote_removed' && payload.removed) {
        const r = payload.removed;
        showNotification({
          type: 'info',
          text: `Se modificó el voto de la membresía #${r.membership} en el Monstruo #${r.monsterNumber}`
        });
      } else if (payload.event === 'reset') {
        showNotification({
          type: 'info',
          text: 'Votación reiniciada: todos los votos se restablecieron a cero.'
        });
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('monsters:init', onInit);
    socket.on('stats:clients', onClientsUpdate);
    socket.on('monsters:updated', onMonstersUpdated);

    // Initial fetch
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
  }, []);

  const showNotification = ({ type, text }) => {
    setNotification({ type, text });
    setTimeout(() => {
      setNotification((curr) => (curr?.text === text ? null : curr));
    }, 4000);
  };

  // Submit Vote
  const handleVoteSubmit = async ({ monsterNumber, membership, count = 1 }) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monsterNumber,
          membership,
          count,
          deviceId: 'Dispositivo Web'
        })
      });

      const data = await res.json();
      if (!data.success) {
        showNotification({
          type: 'error',
          text: data.message || 'Error al registrar el voto'
        });
        return false;
      }
      return true;
    } catch (err) {
      showNotification({
        type: 'error',
        text: err.message || 'Error de red'
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // Remove Vote
  const handleRemoveVote = async (monsterNumber, membership, count = 1, all = false) => {
    try {
      const res = await fetch('/api/vote', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monsterNumber, membership, count, all })
      });
      const data = await res.json();
      if (!data.success) {
        showNotification({
          type: 'error',
          text: data.message || 'Error al eliminar el voto'
        });
      }
    } catch (err) {
      showNotification({
        type: 'error',
        text: err.message || 'Error de red'
      });
    }
  };

  // Select monster and navigate to monsters tab
  const handleNavigateToMonster = (number) => {
    setSelectedMonsterNumber(number);
    setActiveTab('monsters');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset votes
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

  // Export
  const handleExport = () => {
    window.location.href = '/api/export';
  };

  // Import
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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-16 right-4 z-50 max-w-sm w-full p-3 rounded-xl bg-slate-950 border border-slate-700 shadow-xl text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {notification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span className="text-slate-200">{notification.text}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-500 hover:text-white ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <Header
        connected={connected}
        clientCount={clientCount}
        totalVotes={totalVotes}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onExport={handleExport}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'summary'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Resumen Global</span>
            </button>

            <button
              onClick={() => setActiveTab('monsters')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'monsters'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Detalle por Monstruo</span>
            </button>

            <button
              onClick={() => setActiveTab('capture')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'capture'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Capturar Votos</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Archivo persistente: <span className="text-purple-300">data/monsters.json</span>
          </div>
        </div>

        {/* Tab 1: Resumen de votos global */}
        {activeTab === 'summary' && (
          <GlobalSummary
            monsters={monsters}
            totalVotes={totalVotes}
            onSelectMonster={handleNavigateToMonster}
          />
        )}

        {/* Tab 2: Pestaña de Monstruos (con selector y tabla con membresía y cantidad de votos) */}
        {activeTab === 'monsters' && (
          <MonsterDetailTab
            monsters={monsters}
            selectedMonsterNumber={selectedMonsterNumber}
            onSelectMonster={setSelectedMonsterNumber}
            onAddVote={handleVoteSubmit}
            onRemoveVote={handleRemoveVote}
          />
        )}

        {/* Tab 3: Captura Rápida de Votos de papelitos */}
        {activeTab === 'capture' && (
          <VoteCaptureTab
            monsters={monsters}
            selectedMonster={selectedMonsterNumber}
            setSelectedMonster={setSelectedMonsterNumber}
            onVoteSubmit={handleVoteSubmit}
            onRemoveVote={handleRemoveVote}
            recentVotes={recentVotes}
            submitting={submitting}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-3 text-center text-xs text-slate-500">
        Carrera de Monstruos &bull; Sistema de Conteo de Votos
      </footer>

      {/* Modals */}
      <MembershipSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        monsters={monsters}
        onAddVote={handleVoteSubmit}
        onRemoveVote={handleRemoveVote}
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
