import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getMonsters,
  recordVote,
  removeVote,
  findMembership,
  resetAllVotes
} from '../server/storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Running tests for Monster Race Voting System...');

// 1. Get initial monsters
const monsters = getMonsters();
assert.strictEqual(monsters.length, 10, 'Must have exactly 10 monsters');
console.log('✅ Initial 10 monsters loaded successfully.');

// Reset to clean state for test
resetAllVotes();

// 2. Record a valid vote (Monster 6, Membership 5555 as requested in user prompt)
const result1 = recordVote({
  monsterNumber: 6,
  membership: '5555',
  deviceId: 'test-device-1'
});

assert.strictEqual(result1.vote.monsterNumber, 6);
assert.strictEqual(result1.vote.membership, '5555');
const monster6 = result1.monsters.find(m => m.number === 6);
assert.strictEqual(monster6.votes, 1);
assert.ok(monster6.memberships.includes('5555'));
console.log('✅ Vote registered for Monster 6 with membership 5555.');

// 3. Reject duplicate vote on same monster
assert.throws(() => {
  recordVote({ monsterNumber: 6, membership: '5555' });
}, /ya tiene registrado su voto/);
console.log('✅ Prevented duplicate vote for same monster.');

// 4. Reject vote on another monster without allowTransfer
assert.throws(() => {
  recordVote({ monsterNumber: 2, membership: '5555' });
}, /ya votó previamente/);
console.log('✅ Prevented duplicate vote across different monsters.');

// 5. Transfer vote when allowTransfer is true
const transferResult = recordVote({
  monsterNumber: 2,
  membership: '5555',
  allowTransfer: true
});
const m6After = transferResult.monsters.find(m => m.number === 6);
const m2After = transferResult.monsters.find(m => m.number === 2);
assert.strictEqual(m6After.votes, 0);
assert.ok(!m6After.memberships.includes('5555'));
assert.strictEqual(m2After.votes, 1);
assert.ok(m2After.memberships.includes('5555'));
console.log('✅ Successfully transferred vote from Monster 6 to Monster 2.');

// 6. 3-digit membership vote
recordVote({ monsterNumber: 1, membership: '456' });
const m1 = getMonsters().find(m => m.number === 1);
assert.ok(m1.memberships.includes('456'));
console.log('✅ Successfully recorded 3-digit membership (456).');

// 7. Reject invalid memberships (<3 or >4 digits or non-digits)
assert.throws(() => {
  recordVote({ monsterNumber: 1, membership: '12' });
}, /entre 3 y 4 dígitos/);

assert.throws(() => {
  recordVote({ monsterNumber: 1, membership: '12345' });
}, /entre 3 y 4 dígitos/);

assert.throws(() => {
  recordVote({ monsterNumber: 1, membership: 'ABCD' });
}, /entre 3 y 4 dígitos/);
console.log('✅ Rejected invalid membership formats.');

// 8. Find membership
const search = findMembership('456');
assert.strictEqual(search.hasVoted, true);
assert.strictEqual(search.votes[0].number, 1);
console.log('✅ Membership search works correctly.');

// 9. Remove vote
removeVote({ monsterNumber: 1, membership: '456' });
assert.strictEqual(findMembership('456').hasVoted, false);
console.log('✅ Remove vote works correctly.');

// 10. Reset votes
resetAllVotes();
const allCleared = getMonsters().every(m => m.votes === 0 && m.memberships.length === 0);
assert.ok(allCleared, 'All votes must be cleared on reset');
console.log('✅ Reset all votes works correctly.');

console.log('🎉 All 10 tests passed successfully!');
