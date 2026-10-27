import React, { useState, useEffect } from 'react';
import { socket } from './socket';
import Header from './components/Header';
import GlobalSummary from './components/GlobalSummary';
import MonsterDetailTab from './components/MonsterDetailTab';
import VoteCaptureTab from './components/VoteCaptureTab';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [monsters, setMonsters] = useState([]);
  const [connected, setConnected] = useState(false);
  const [clientCount, setClientCount] = useState(1);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'monsters' | 'capture'
  const [selectedMonsterNumber, setSelectedMonsterNumber] = useState(1);
  const [recentVotes, setRecentVotes] = useState([]);
  const [notification, setNotification] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
          text: `Vote counted: Membership #${v.membership} added ${v.addedCount || 1} vote(s) to #${v.monsterNumber} ${targetM?.name || ''}`
        });
      } else if (payload.event === 'vote_removed' && payload.removed) {
        const r = payload.removed;
        showNotification({
          type: 'info',
          text: `Vote modified for membership #${r.membership} on Monster #${r.monsterNumber}`
        });
      } else if (payload.event === 'reset') {
        showNotification({
          type: 'info',
          text: 'Voting reset: all votes have been cleared to zero.'
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
          deviceId: 'Web Device'
        })
      });

      const data = await res.json();
      if (!data.success) {
        showNotification({
          type: 'error',
          text: data.message || 'Error recording vote'
        });
        return false;
      }
      return true;
    } catch (err) {
      showNotification({
        type: 'error',
        text: err.message || 'Network error'
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
          text: data.message || 'Error removing vote'
        });
      }
    } catch (err) {
      showNotification({
        type: 'error',
        text: err.message || 'Network error'
      });
    }
  };

  // Select monster and navigate to monsters tab
  const handleNavigateToMonster = (number) => {
    setSelectedMonsterNumber(number);
    setActiveTab('monsters');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalVotes = monsters.reduce((acc, m) => acc + (m.votes || 0), 0);

  return (
    <div className="min-h-screen bg-[#211c22] text-[#f3eff5] flex flex-col font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-16 right-4 z-50 max-w-sm w-full p-3.5 rounded-xl bg-[#373038] border border-[#4d4250] shadow-2xl text-xs flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            {notification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-[#FB702D] shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#88E032] shrink-0" />
            )}
            <span className="text-white font-medium">{notification.text}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-[#b8adb9] hover:text-white ml-2 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header with Navigation Tabs */}
      <Header
        connected={connected}
        clientCount={clientCount}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* Tab 1: Global vote summary */}
        {activeTab === 'summary' && (
          <GlobalSummary
            monsters={monsters}
            totalVotes={totalVotes}
            onSelectMonster={handleNavigateToMonster}
          />
        )}

        {/* Tab 2: Monsters Tab (monster selector and table with membership and vote count) */}
        {activeTab === 'monsters' && (
          <MonsterDetailTab
            monsters={monsters}
            selectedMonsterNumber={selectedMonsterNumber}
            onSelectMonster={setSelectedMonsterNumber}
            onAddVote={handleVoteSubmit}
            onRemoveVote={handleRemoveVote}
          />
        )}

        {/* Tab 3: Fast ballot vote capture */}
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
      <footer className="mt-auto border-t border-[#493e4c] bg-[#2a232b] py-3 text-center text-xs text-[#b8adb9]">
        <span className="font-cinzel text-sm font-bold text-[#FFC341] mr-1">Monster Race</span> &bull; Daniel Blasquez Chacón &bull; Live Vote Counting System
      </footer>
    </div>
  );
}
