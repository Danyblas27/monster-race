import React, { useState, useEffect, useMemo } from 'react';
import { socket } from './socket';
import Header from './components/Header';
import DateFilterBar from './components/DateFilterBar';
import GlobalSummary from './components/GlobalSummary';
import MonsterDetailTab from './components/MonsterDetailTab';
import VoteCaptureTab from './components/VoteCaptureTab';
import { CheckCircle2, AlertCircle, Database, RotateCcw, X } from 'lucide-react';

function computeVotesByMembership(memberships) {
  const counts = {};
  for (const mem of memberships) {
    const key = String(mem).trim();
    if (key) {
      counts[key] = (counts[key] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .map(([membership, count]) => ({ membership, count }))
    .sort((a, b) => b.count - a.count || a.membership.localeCompare(b.membership));
}

export function getMexicoDateString() {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Mexico_City',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(new Date());
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

export default function App() {
  const [monsters, setMonsters] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [today, setToday] = useState(getMexicoDateString);
  const [selectedDate, setSelectedDate] = useState('all');
  const [connected, setConnected] = useState(false);
  const [clientCount, setClientCount] = useState(1);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'monsters' | 'capture'
  const [selectedMonsterNumber, setSelectedMonsterNumber] = useState(1);
  const [recentVotes, setRecentVotes] = useState([]);
  const [notification, setNotification] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [restorePrompt, setRestorePrompt] = useState(null);

  useEffect(() => {
    if (socket.connected) {
      setConnected(true);
    }

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    const onInit = (data) => {
      if (data?.monsters) {
        setMonsters(data.monsters);
        checkLocalBackup(data.monsters);
      }
      if (data?.availableDates) setAvailableDates(data.availableDates);
      if (data?.today) setToday(data.today);
      if (data?.clientCount) setClientCount(data.clientCount);
    };

    const onClientsUpdate = (data) => {
      if (data?.count !== undefined) setClientCount(data.count);
    };

    const onMonstersUpdated = (payload) => {
      if (payload?.monsters) {
        setMonsters(payload.monsters);
        // Persist copy in localStorage as safety mirror
        try {
          const total = payload.monsters.reduce((acc, m) => acc + (m.votes || 0), 0);
          if (total > 0) {
            localStorage.setItem(
              'monster_race_backup',
              JSON.stringify({
                monsters: payload.monsters,
                total,
                timestamp: new Date().toISOString()
              })
            );
          }
        } catch {
          // ignore localStorage failures
        }
      }

      if (payload?.availableDates) {
        setAvailableDates(payload.availableDates);
      }

      if (payload.event === 'vote_added' && payload.vote) {
        const v = payload.vote;
        const targetM = payload.monsters.find((m) => m.number === v.monsterNumber);

        setRecentVotes((prev) => [
          {
            id: Date.now() + Math.random(),
            monsterNumber: v.monsterNumber,
            monsterName: v.monsterName || targetM?.name,
            membership: v.membership,
            addedCount: v.addedCount || 1,
            date: v.date,
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
          text: payload.clearedDate && payload.clearedDate !== 'all'
            ? `Voting reset for ${payload.clearedDate}.`
            : 'Voting reset: all votes have been cleared.'
        });
      } else if (payload.event === 'imported') {
        showNotification({
          type: 'success',
          text: 'Backup restored successfully onto server!'
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
          if (data.availableDates) setAvailableDates(data.availableDates);
          if (data.today) setToday(data.today);
          checkLocalBackup(data.monsters);
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

  // Check if browser has a saved backup that the server might have lost (e.g. after container restart)
  const checkLocalBackup = (serverMonsters) => {
    try {
      const serverTotal = serverMonsters.reduce((acc, m) => acc + (m.votes || 0), 0);
      if (serverTotal === 0) {
        const localRaw = localStorage.getItem('monster_race_backup');
        if (localRaw) {
          const parsed = JSON.parse(localRaw);
          if (parsed && Array.isArray(parsed.monsters) && parsed.total > 0) {
            setRestorePrompt(parsed);
          }
        }
      } else {
        setRestorePrompt(null);
      }
    } catch {
      // ignore
    }
  };

  const showNotification = ({ type, text }) => {
    setNotification({ type, text });
    setTimeout(() => {
      setNotification((curr) => (curr?.text === text ? null : curr));
    }, 4000);
  };

  // Submit Vote
  const handleVoteSubmit = async ({ monsterNumber, membership, count = 1, date }) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monsterNumber,
          membership,
          count,
          date,
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
  const handleRemoveVote = async (monsterNumber, membership, count = 1, all = false, date = null) => {
    try {
      const res = await fetch('/api/vote', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monsterNumber, membership, count, all, date })
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

  // Export full backup to a downloadable JSON file
  const handleExportBackup = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(monsters, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `monster_race_backup_${today}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showNotification({
        type: 'success',
        text: `Full backup downloaded: monster_race_backup_${today}.json`
      });
    } catch (err) {
      showNotification({
        type: 'error',
        text: 'Failed to download backup file.'
      });
    }
  };

  // Import JSON backup and send to server
  const handleImportBackup = (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        const list = Array.isArray(parsed) ? parsed : parsed.monsters;
        if (!Array.isArray(list) || list.length === 0) {
          throw new Error('Invalid JSON format: must contain an array of monsters.');
        }

        const res = await fetch('/api/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ monsters: list })
        });
        const resData = await res.json();
        if (resData.success) {
          setRestorePrompt(null);
          showNotification({
            type: 'success',
            text: 'Backup successfully restored to server!'
          });
        } else {
          showNotification({
            type: 'error',
            text: resData.message || 'Error restoring backup'
          });
        }
      } catch (err) {
        showNotification({
          type: 'error',
          text: err.message || 'Failed to read backup JSON file.'
        });
      }
    };
    reader.readAsText(file);
  };

  // Restore server from prompt (local backup found)
  const handleRestoreFromLocal = async () => {
    if (!restorePrompt?.monsters) return;
    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monsters: restorePrompt.monsters })
      });
      const resData = await res.json();
      if (resData.success) {
        setRestorePrompt(null);
        showNotification({
          type: 'success',
          text: 'Restored saved voting data from local backup!'
        });
      }
    } catch (err) {
      showNotification({
        type: 'error',
        text: 'Failed to restore local backup to server.'
      });
    }
  };

  // Select monster and navigate to monsters tab
  const handleNavigateToMonster = (number) => {
    setSelectedMonsterNumber(number);
    setActiveTab('monsters');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Compute filtered view of monsters according to selectedDate
  const displayMonsters = useMemo(() => {
    if (!selectedDate || selectedDate === 'all') {
      return monsters;
    }
    return monsters.map((m) => {
      const dayBallots = (m.ballots || []).filter((b) => b.date === selectedDate);
      const dayMemberships = dayBallots.map((b) => b.membership);
      return {
        ...m,
        ballots: dayBallots,
        memberships: dayMemberships,
        votes: dayBallots.length,
        votesByMembership: computeVotesByMembership(dayMemberships)
      };
    });
  }, [monsters, selectedDate]);

  const displayTotalVotes = useMemo(() => {
    return displayMonsters.reduce((acc, m) => acc + (m.votes || 0), 0);
  }, [displayMonsters]);

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
        {/* Local Backup Recovery Banner */}
        {restorePrompt && (
          <div className="bg-[#36271c] border border-[#FB702D]/60 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#FB702D]/20 text-[#FB702D] shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Saved Local Backup Detected</span>
                  <span className="text-xs bg-[#FB702D] text-white px-2 py-0.5 rounded font-mono font-bold">
                    {restorePrompt.total} votes
                  </span>
                </h3>
                <p className="text-xs text-[#c9bfcc] mt-0.5">
                  The server is currently at 0 votes (e.g. after a restart or wake-up). Would you like to restore your previous voting data?
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                onClick={handleRestoreFromLocal}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#88E032] hover:bg-[#97f23c] text-[#211c22] font-black text-xs transition shadow"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore to Server</span>
              </button>
              <button
                onClick={() => setRestorePrompt(null)}
                className="p-1.5 rounded-xl text-[#b8adb9] hover:text-white bg-[#211c22] border border-[#4d4250] transition"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Global Date Filter & Backup Bar */}
        <DateFilterBar
          availableDates={availableDates}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          monsters={monsters}
          today={today}
          onExportBackup={handleExportBackup}
          onImportBackup={handleImportBackup}
        />

        {/* Tab 1: Global vote summary */}
        {activeTab === 'summary' && (
          <GlobalSummary
            monsters={displayMonsters}
            totalVotes={displayTotalVotes}
            selectedDate={selectedDate}
            today={today}
            onSelectMonster={handleNavigateToMonster}
          />
        )}

        {/* Tab 2: Monsters Tab (monster selector and table with membership and vote count) */}
        {activeTab === 'monsters' && (
          <MonsterDetailTab
            monsters={displayMonsters}
            selectedMonsterNumber={selectedMonsterNumber}
            onSelectMonster={setSelectedMonsterNumber}
            onAddVote={handleVoteSubmit}
            onRemoveVote={handleRemoveVote}
            selectedDate={selectedDate}
            today={today}
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
            today={today}
            selectedDate={selectedDate}
            availableDates={availableDates}
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