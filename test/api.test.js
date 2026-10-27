import assert from 'assert';
import {
  getMonsters,
  recordVote,
  removeVote,
  findMembership,
  resetAllVotes
} from '../server/storage.js';

console.log('🧪 Running tests for Monster Race Voting System...');

// 1. Initial monsters
const monsters = getMonsters();
assert.strictEqual(monsters.length, 10, 'Must have exactly 10 monsters');
console.log('✅ Initial 10 monsters loaded successfully.');

// Reset
resetAllVotes();

// 2. Multiple votes from membership 5555 for Monster 6
recordVote({ monsterNumber: 6, membership: '5555' });
recordVote({ monsterNumber: 6, membership: '5555' });
recordVote({ monsterNumber: 6, membership: '5555' });

const m6 = getMonsters().find(m => m.number === 6);
assert.strictEqual(m6.votes, 3, 'Monster 6 should have 3 votes');
assert.strictEqual(m6.memberships.length, 3, 'Memberships array should have 3 entries');

// 3. Check votesByMembership: must appear ONLY ONCE with count = 3
assert.strictEqual(m6.votesByMembership.length, 1, '5555 must appear once in votesByMembership');
assert.strictEqual(m6.votesByMembership[0].membership, '5555');
assert.strictEqual(m6.votesByMembership[0].count, 3);
console.log('✅ Multiple votes allowed: 5555 voted 3 times and appears ONCE with count 3 in table aggregation.');

// 4. Same membership 5555 can also vote for another monster (e.g. Monster 1)
recordVote({ monsterNumber: 1, membership: '5555' });
const m1 = getMonsters().find(m => m.number === 1);
assert.strictEqual(m1.votes, 1);
console.log('✅ Membership 5555 can vote for different monsters.');

// 5. Another voter (456) votes for Monster 6
recordVote({ monsterNumber: 6, membership: '456' });
const m6Updated = getMonsters().find(m => m.number === 6);
assert.strictEqual(m6Updated.votes, 4);
assert.strictEqual(m6Updated.votesByMembership.length, 2, 'Monster 6 should now have 2 distinct voters');
console.log('✅ 3-digit membership (456) recorded successfully.');

// 6. Test membership search
const search = findMembership('5555');
assert.strictEqual(search.hasVoted, true);
assert.strictEqual(search.totalVotes, 4, '5555 has 4 total votes across all monsters (3 for #6, 1 for #1)');
assert.strictEqual(search.breakdown.length, 2);
console.log('✅ Membership search returns comprehensive breakdown.');

// 7. Decrement vote (remove 1 vote from 5555 on Monster 6)
removeVote({ monsterNumber: 6, membership: '5555', count: 1 });
const m6AfterDec = getMonsters().find(m => m.number === 6);
const voter5555 = m6AfterDec.votesByMembership.find(v => v.membership === '5555');
assert.strictEqual(voter5555.count, 2, '5555 should now have 2 votes on monster 6');
console.log('✅ Decrement vote (-1) works correctly.');

// 8. Remove all votes from 5555 on Monster 6
removeVote({ monsterNumber: 6, membership: '5555', all: true });
const m6AfterDel = getMonsters().find(m => m.number === 6);
const voter5555After = m6AfterDel.votesByMembership.find(v => v.membership === '5555');
assert.strictEqual(voter5555After, undefined, '5555 should be removed completely from monster 6');
assert.strictEqual(m6AfterDel.votes, 1, 'Only 456 vote remains on monster 6');
console.log('✅ Remove all votes for a membership works.');

// 9. Reset all votes
resetAllVotes();
const allCleared = getMonsters().every(m => m.votes === 0 && m.memberships.length === 0 && m.votesByMembership.length === 0);
assert.ok(allCleared, 'All votes must be reset to 0');
console.log('✅ Reset all votes works correctly.');

console.log('🎉 All storage tests passed successfully!');
