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
  for (const m of monsters) {
    if (!Array.isArray(m.memberships)) {
      m.memberships = [];
    }
    // Memberships can contain duplicate entries (a member can vote multiple times)
    m.memberships = m.memberships.map((id) => String(id).trim()).filter(Boolean);
    m.votes = m.memberships.length;
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
 * Add a vote (A membership can vote multiple times for the same monster)
 * @param {Object} param0
 * @param {number} param0.monsterNumber - 1 to 10
 * @param {string|number} param0.membership - 3 to 4 digits
 * @param {number} [param0.count=1] - Number of votes to add
 * @param {string} [param0.deviceId] - optional identifier of operator/device
 */
export function recordVote({ monsterNumber, membership, count = 1, deviceId = 'anon' }) {
  const num = parseInt(monsterNumber, 10);
  if (isNaN(num) || num < 1 || num > 10) {
    throw new Error('El número del monstruo debe ser entre 1 y 10.');
  }

  const memStr = String(membership).trim();
  if (!/^\d{3,4}$/.test(memStr)) {
    throw new Error('El número de membresía debe tener entre 3 y 4 dígitos numéricos.');
  }

  const addCount = Math.max(1, parseInt(count, 10) || 1);

  const monsters = getMonsters();
  const targetMonster = monsters.find((m) => m.number === num);
  if (!targetMonster) {
    throw new Error(`Monstruo con número ${num} no encontrado.`);
  }

  // Push the membership addCount times
  for (let i = 0; i < addCount; i++) {
    targetMonster.memberships.push(memStr);
  }

  targetMonster.votes = targetMonster.memberships.length;
  targetMonster.votesByMembership = computeVotesByMembership(targetMonster.memberships);

  saveMonstersSync(monsters);

  const currentMemberTotal = targetMonster.memberships.filter((id) => id === memStr).length;

  return {
    monsters,
    vote: {
      monsterNumber: num,
      monsterName: targetMonster.name,
      membership: memStr,
      addedCount: addCount,
      memberTotalVotesForMonster: currentMemberTotal,
      deviceId,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Remove vote(s) for a membership from a monster
 * @param {Object} param0
 * @param {number} param0.monsterNumber
 * @param {string} param0.membership
 * @param {number} [param0.count=1] - how many votes to decrement (if all=false)
 * @param {boolean} [param0.all=false] - if true, deletes all votes of this membership for this monster
 */
export function removeVote({ monsterNumber, membership, count = 1, all = false }) {
  const num = parseInt(monsterNumber, 10);
  const memStr = String(membership).trim();

  const monsters = getMonsters();
  const targetMonster = monsters.find((m) => m.number === num);

  if (!targetMonster) {
    throw new Error(`Monstruo #${num} no encontrado.`);
  }

  const occurrences = targetMonster.memberships.filter((id) => id === memStr).length;
  if (occurrences === 0) {
    throw new Error(`La membresía ${memStr} no tiene votos registrados en el monstruo #${num}.`);
  }

  if (all) {
    // Remove all votes from this member
    targetMonster.memberships = targetMonster.memberships.filter((id) => id !== memStr);
  } else {
    // Remove 'count' occurrences (usually 1)
    let toRemove = Math.min(occurrences, Math.max(1, parseInt(count, 10) || 1));
    const newMemberships = [];
    for (const id of targetMonster.memberships) {
      if (id === memStr && toRemove > 0) {
        toRemove--;
      } else {
        newMemberships.push(id);
      }
    }
    targetMonster.memberships = newMemberships;
  }

  targetMonster.votes = targetMonster.memberships.length;
  targetMonster.votesByMembership = computeVotesByMembership(targetMonster.memberships);

  saveMonstersSync(monsters);

  const remaining = targetMonster.memberships.filter((id) => id === memStr).length;

  return {
    monsters,
    removed: {
      monsterNumber: num,
      monsterName: targetMonster.name,
      membership: memStr,
      remainingVotes: remaining,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Search membership status across all monsters
 */
export function findMembership(membership) {
  const memStr = String(membership).trim();
  const monsters = getMonsters();
  const breakdown = [];
  let totalVotes = 0;

  for (const m of monsters) {
    const count = m.memberships.filter((id) => id === memStr).length;
    if (count > 0) {
      breakdown.push({
        number: m.number,
        name: m.name,
        emoji: m.emoji,
        color: m.color,
        count
      });
      totalVotes += count;
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
 * Reset all votes to 0
 */
export function resetAllVotes() {
  const monsters = getMonsters();
  for (const m of monsters) {
    m.memberships = [];
    m.votes = 0;
    m.votesByMembership = [];
  }
  saveMonstersSync(monsters);
  return { monsters, timestamp: new Date().toISOString() };
}

/**
 * Update monster details (name, emoji, color)
 */
export function updateMonster(number, updates) {
  const num = parseInt(number, 10);
  const monsters = getMonsters();
  const monster = monsters.find((m) => m.number === num);
  if (!monster) {
    throw new Error(`Monstruo #${num} no encontrado.`);
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
