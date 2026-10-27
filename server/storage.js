import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Persistent data directory and file path
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'monsters.json');
const DEFAULT_DATA_FILE = path.join(__dirname, 'defaultData.json');

// Ensure directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// In-memory cache & write queue lock
let monstersCache = null;
let writeQueue = Promise.resolve();

/**
 * Returns today's date formatted as YYYY-MM-DD in Mexico City (CDMX) timezone
 */
export function getTodayDateString() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(new Date());
}

/**
 * Returns a readable timestamp in Mexico City (CDMX) timezone
 */
export function getMexicoTimestamp() {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(new Date());
}

export function computeVotesByMembership(memberships) {
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

function validateAndNormalizeData(monsters) {
  if (!Array.isArray(monsters)) {
    throw new Error('Data is not an array of monsters');
  }

  const todayStr = getTodayDateString();

  for (const m of monsters) {
    // Normalize ballots array
    if (!Array.isArray(m.ballots)) {
      m.ballots = [];
    }

    // Backward compatibility: if ballots empty but memberships exists
    if (m.ballots.length === 0 && Array.isArray(m.memberships) && m.memberships.length > 0) {
      m.ballots = m.memberships.map((id, idx) => ({
        id: `legacy_${Date.now()}_${m.number}_${idx}`,
        membership: String(id).trim(),
        date: todayStr,
        timestamp: new Date().toISOString(),
        deviceId: 'legacy'
      }));
    }

    // Clean and validate ballots
    m.ballots = m.ballots
      .filter((b) => b && typeof b === 'object' && b.membership)
      .map((b) => ({
        id: b.id || `b_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        membership: String(b.membership).trim(),
        date: b.date && /^\d{4}-\d{2}-\d{2}$/.test(b.date) ? b.date : todayStr,
        timestamp: b.timestamp || new Date().toISOString(),
        deviceId: b.deviceId || 'Web Device'
      }));

    // Derived properties
    m.memberships = m.ballots.map((b) => b.membership);
    m.votes = m.ballots.length;
    m.votesByMembership = computeVotesByMembership(m.memberships);
  }
}

export function getMonsters() {
  if (monstersCache) {
    return monstersCache;
  }

  ensureDataDir();

  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      monstersCache = JSON.parse(raw);
      validateAndNormalizeData(monstersCache);
      return monstersCache;
    } catch (err) {
      console.error('Error reading data file, falling back to default data:', err);
    }
  }

  // Load default data
  const defaultRaw = fs.readFileSync(DEFAULT_DATA_FILE, 'utf-8');
  monstersCache = JSON.parse(defaultRaw);
  validateAndNormalizeData(monstersCache);
  saveMonstersSync(monstersCache);
  return monstersCache;
}

// Atomic file write
function saveMonstersSync(data) {
  ensureDataDir();
  validateAndNormalizeData(data);
  const tempPath = `${DATA_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempPath, DATA_FILE);
  monstersCache = data;
}

export function saveMonsters(data) {
  writeQueue = writeQueue.then(() => {
    saveMonstersSync(data);
  });
  return writeQueue;
}

/**
 * Get distinct dates that contain votes, plus today's date
 * @returns {string[]} Sorted array of YYYY-MM-DD (descending)
 */
export function getAvailableDates() {
  const monsters = getMonsters();
  const dateSet = new Set();
  dateSet.add(getTodayDateString());

  for (const m of monsters) {
    if (Array.isArray(m.ballots)) {
      for (const b of m.ballots) {
        if (b && b.date) {
          dateSet.add(b.date);
        }
      }
    }
  }

  return Array.from(dateSet).sort((a, b) => b.localeCompare(a));
}

/**
 * Return monsters with votes and statistics filtered by a specific date
 * @param {string} [dateFilter='all'] - 'all' or 'YYYY-MM-DD'
 */
export function getMonstersFiltered(dateFilter = 'all') {
  const monsters = getMonsters();
  if (!dateFilter || dateFilter === 'all') {
    return monsters;
  }

  return monsters.map((m) => {
    const dayBallots = (m.ballots || []).filter((b) => b.date === dateFilter);
    const dayMemberships = dayBallots.map((b) => b.membership);
    return {
      ...m,
      ballots: dayBallots,
      memberships: dayMemberships,
      votes: dayBallots.length,
      votesByMembership: computeVotesByMembership(dayMemberships)
    };
  });
}

/**
 * Add a vote (A membership can vote multiple times for the same monster)
 * @param {Object} param0
 * @param {number} param0.monsterNumber - 1 to 10
 * @param {string|number} param0.membership - 3 to 4 digits
 * @param {number} [param0.count=1] - Number of votes to add
 * @param {string} [param0.deviceId] - optional identifier of operator/device
 * @param {string} [param0.date] - optional date YYYY-MM-DD (defaults to today)
 */
export function recordVote({ monsterNumber, membership, count = 1, deviceId = 'Web Device', date }) {
  const num = parseInt(monsterNumber, 10);
  if (isNaN(num) || num < 1 || num > 10) {
    throw new Error('Monster number must be between 1 and 10.');
  }

  const memStr = String(membership).trim();
  if (!/^\d{3,4}$/.test(memStr)) {
    throw new Error('Membership number must be between 3 and 4 numeric digits.');
  }

  const addCount = Math.max(1, parseInt(count, 10) || 1);
  const voteDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : getTodayDateString();

  const monsters = getMonsters();
  const targetMonster = monsters.find((m) => m.number === num);
  if (!targetMonster) {
    throw new Error(`Monster #${num} not found.`);
  }

  if (!Array.isArray(targetMonster.ballots)) {
    targetMonster.ballots = [];
  }

  // Push the ballot addCount times
  const newBallots = [];
  const now = new Date().toISOString();
  for (let i = 0; i < addCount; i++) {
    const ballot = {
      id: `b_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      membership: memStr,
      date: voteDate,
      timestamp: now,
      deviceId: String(deviceId || 'Web Device')
    };
    targetMonster.ballots.push(ballot);
    newBallots.push(ballot);
  }

  targetMonster.memberships = targetMonster.ballots.map((b) => b.membership);
  targetMonster.votes = targetMonster.ballots.length;
  targetMonster.votesByMembership = computeVotesByMembership(targetMonster.memberships);

  saveMonstersSync(monsters);

  const currentMemberTotal = targetMonster.ballots.filter((b) => b.membership === memStr).length;
  const currentMemberDayTotal = targetMonster.ballots.filter(
    (b) => b.membership === memStr && b.date === voteDate
  ).length;

  return {
    monsters,
    vote: {
      monsterNumber: num,
      monsterName: targetMonster.name,
      membership: memStr,
      addedCount: addCount,
      date: voteDate,
      memberTotalVotesForMonster: currentMemberTotal,
      memberDayVotesForMonster: currentMemberDayTotal,
      deviceId,
      timestamp: now
    }
  };
}

/**
 * Remove vote(s) for a membership from a monster
 * @param {Object} param0
 * @param {number} param0.monsterNumber
 * @param {string} param0.membership
 * @param {number} [param0.count=1] - how many votes to decrement (if all=false)
 * @param {boolean} [param0.all=false] - if true, deletes all votes of this membership
 * @param {string} [param0.date] - optional date YYYY-MM-DD filter
 */
export function removeVote({ monsterNumber, membership, count = 1, all = false, date }) {
  const num = parseInt(monsterNumber, 10);
  const memStr = String(membership).trim();

  const monsters = getMonsters();
  const targetMonster = monsters.find((m) => m.number === num);

  if (!targetMonster) {
    throw new Error(`Monster #${num} not found.`);
  }

  if (!Array.isArray(targetMonster.ballots)) {
    targetMonster.ballots = [];
  }

  const dateFilter = date && date !== 'all' ? date : null;

  const matchingBallots = targetMonster.ballots.filter(
    (b) => b.membership === memStr && (!dateFilter || b.date === dateFilter)
  );

  if (matchingBallots.length === 0) {
    const scopeMsg = dateFilter ? ` for date ${dateFilter}` : '';
    throw new Error(`Membership ${memStr} has no votes registered for Monster #${num}${scopeMsg}.`);
  }

  if (all) {
    // Remove all matching ballots
    targetMonster.ballots = targetMonster.ballots.filter(
      (b) => !(b.membership === memStr && (!dateFilter || b.date === dateFilter))
    );
  } else {
    // Decrement: remove the latest 'count' matching ballots
    let toRemove = Math.min(matchingBallots.length, Math.max(1, parseInt(count, 10) || 1));
    // Remove from the end (most recent)
    const newBallots = [];
    const reversed = [...targetMonster.ballots].reverse();
    for (const b of reversed) {
      if (b.membership === memStr && (!dateFilter || b.date === dateFilter) && toRemove > 0) {
        toRemove--;
      } else {
        newBallots.unshift(b);
      }
    }
    targetMonster.ballots = newBallots;
  }

  targetMonster.memberships = targetMonster.ballots.map((b) => b.membership);
  targetMonster.votes = targetMonster.ballots.length;
  targetMonster.votesByMembership = computeVotesByMembership(targetMonster.memberships);

  saveMonstersSync(monsters);

  const remaining = targetMonster.ballots.filter((b) => b.membership === memStr).length;

  return {
    monsters,
    removed: {
      monsterNumber: num,
      monsterName: targetMonster.name,
      membership: memStr,
      date: dateFilter || 'all',
      remainingVotes: remaining,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Search membership status across all monsters and days
 */
export function findMembership(membership) {
  const memStr = String(membership).trim();
  const monsters = getMonsters();
  const breakdown = [];
  let totalVotes = 0;

  for (const m of monsters) {
    const memberBallots = (m.ballots || []).filter((b) => b.membership === memStr);
    if (memberBallots.length > 0) {
      const byDate = {};
      for (const b of memberBallots) {
        byDate[b.date] = (byDate[b.date] || 0) + 1;
      }

      breakdown.push({
        number: m.number,
        name: m.name,
        image: m.image,
        color: m.color,
        count: memberBallots.length,
        byDate
      });
      totalVotes += memberBallots.length;
    }
  }

  return {
    membership: memStr,
    hasVoted: totalVotes > 0,
    totalVotes,
    breakdown
  };
}

/**
 * Reset votes
 * @param {Object} [options]
 * @param {string} [options.date] - If provided and !== 'all', only clears votes on that date
 */
export function resetAllVotes(options = {}) {
  const { date } = options;
  const monsters = getMonsters();

  if (date && date !== 'all') {
    for (const m of monsters) {
      if (Array.isArray(m.ballots)) {
        m.ballots = m.ballots.filter((b) => b.date !== date);
        m.memberships = m.ballots.map((b) => b.membership);
        m.votes = m.ballots.length;
        m.votesByMembership = computeVotesByMembership(m.memberships);
      }
    }
  } else {
    for (const m of monsters) {
      m.ballots = [];
      m.memberships = [];
      m.votes = 0;
      m.votesByMembership = [];
    }
  }

  saveMonstersSync(monsters);
  return { monsters, clearedDate: date || 'all', timestamp: new Date().toISOString() };
}

/**
 * Update monster details (name, emoji, color)
 */
export function updateMonster(number, updates) {
  const num = parseInt(number, 10);
  const monsters = getMonsters();
  const monster = monsters.find((m) => m.number === num);
  if (!monster) {
    throw new Error(`Monster #${num} not found.`);
  }

  if (updates.name && typeof updates.name === 'string') {
    monster.name = updates.name.trim();
  }
  if (updates.emoji && typeof updates.emoji === 'string') {
    monster.emoji = updates.emoji.trim();
  }
  if (updates.color && typeof updates.color === 'string') {
    monster.color = updates.color.trim();
  }

  saveMonstersSync(monsters);
  return { monsters, updatedMonster: monster };
}

/**
 * Restore default monsters
 */
export function restoreDefaults() {
  const defaultRaw = fs.readFileSync(DEFAULT_DATA_FILE, 'utf-8');
  monstersCache = JSON.parse(defaultRaw);
  validateAndNormalizeData(monstersCache);
  saveMonstersSync(monstersCache);
  return { monsters: monstersCache };
}
