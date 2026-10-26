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

export function getMonsters() {
  if (monstersCache) {
    return monstersCache;
  }

  ensureDataDir();

  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      monstersCache = JSON.parse(raw);
      // Ensure data integrity
      validateAndNormalizeData(monstersCache);
      return monstersCache;
    } catch (err) {
      console.error('Error reading data file, falling back to default data:', err);
    }
  }

  // Load default data
  const defaultRaw = fs.readFileSync(DEFAULT_DATA_FILE, 'utf-8');
  monstersCache = JSON.parse(defaultRaw);
  saveMonstersSync(monstersCache);
  return monstersCache;
}

function validateAndNormalizeData(monsters) {
  if (!Array.isArray(monsters)) {
    throw new Error('Data is not an array of monsters');
  }
  for (const m of monsters) {
    if (!Array.isArray(m.memberships)) {
      m.memberships = [];
    }
    // Deduplicate memberships just in case
    m.memberships = Array.from(new Set(m.memberships.map(String)));
    m.votes = m.memberships.length;
  }
}

// Atomic file write
function saveMonstersSync(data) {
  ensureDataDir();
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
 * Add a vote
 * @param {Object} param0
 * @param {number} param0.monsterNumber - 1 to 10
 * @param {string|number} param0.membership - 3 to 4 digits
 * @param {boolean} [param0.allowTransfer] - If already voted for another monster, move it
 * @param {string} [param0.deviceId] - optional identifier of operator/device
 */
export function recordVote({ monsterNumber, membership, allowTransfer = false, deviceId = 'anon' }) {
  const num = parseInt(monsterNumber, 10);
  if (isNaN(num) || num < 1 || num > 10) {
    throw new Error('El número del monstruo debe ser entre 1 y 10.');
  }

  const memStr = String(membership).trim();
  if (!/^\d{3,4}$/.test(memStr)) {
    throw new Error('El número de membresía debe tener entre 3 y 4 dígitos numéricos.');
  }

  const monsters = getMonsters();
  const targetMonster = monsters.find((m) => m.number === num);
  if (!targetMonster) {
    throw new Error(`Monstruo con número ${num} no encontrado.`);
  }

  // Check if already voted for this monster
  if (targetMonster.memberships.includes(memStr)) {
    throw new Error(`La membresía ${memStr} ya tiene registrado su voto para el monstruo #${num} (${targetMonster.name}).`);
  }

  // Check if already voted for ANY other monster
  const previousVoteMonster = monsters.find(
    (m) => m.number !== num && m.memberships.includes(memStr)
  );

  if (previousVoteMonster) {
    if (!allowTransfer) {
      const error = new Error(`La membresía ${memStr} ya votó previamente por el monstruo #${previousVoteMonster.number} (${previousVoteMonster.name}).`);
      error.code = 'MEMBERSHIP_ALREADY_VOTED';
      error.previousMonster = {
        number: previousVoteMonster.number,
        name: previousVoteMonster.name,
      };
      throw error;
    } else {
      // Transfer vote from previous monster
      previousVoteMonster.memberships = previousVoteMonster.memberships.filter((id) => id !== memStr);
      previousVoteMonster.votes = previousVoteMonster.memberships.length;
    }
  }

  // Add vote to target
  targetMonster.memberships.push(memStr);
  targetMonster.votes = targetMonster.memberships.length;

  saveMonstersSync(monsters);

  return {
    monsters,
    vote: {
      monsterNumber: num,
      monsterName: targetMonster.name,
      membership: memStr,
      transferredFrom: previousVoteMonster ? previousVoteMonster.number : null,
      deviceId,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Remove a specific vote
 */
export function removeVote({ monsterNumber, membership }) {
  const num = parseInt(monsterNumber, 10);
  const memStr = String(membership).trim();

  const monsters = getMonsters();
  const targetMonster = monsters.find((m) => m.number === num);

  if (!targetMonster) {
    throw new Error(`Monstruo #${num} no encontrado.`);
  }

  const index = targetMonster.memberships.indexOf(memStr);
  if (index === -1) {
    throw new Error(`La membresía ${memStr} no se encuentra en el monstruo #${num}.`);
  }

  targetMonster.memberships.splice(index, 1);
  targetMonster.votes = targetMonster.memberships.length;

  saveMonstersSync(monsters);

  return {
    monsters,
    removed: {
      monsterNumber: num,
      monsterName: targetMonster.name,
      membership: memStr,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Search membership status
 */
export function findMembership(membership) {
  const memStr = String(membership).trim();
  const monsters = getMonsters();
  const votes = [];

  for (const m of monsters) {
    if (m.memberships.includes(memStr)) {
      votes.push({
        number: m.number,
        name: m.name,
        emoji: m.emoji
      });
    }
  }

  return {
    membership: memStr,
    hasVoted: votes.length > 0,
    votes
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
  saveMonstersSync(monstersCache);
  return { monsters: monstersCache };
}
