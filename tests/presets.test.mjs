import assert from 'node:assert/strict';
import { DEFAULT_EXAMPLES, cloneExample, findDefaultExample } from '../src/scenarios.js';

const original = findDefaultExample('clean-seed');
const copy = cloneExample(original);
copy.startingOwnership.founder = 1;
copy.rounds[0].invested = 999;

assert.notEqual(original.startingOwnership.founder, copy.startingOwnership.founder, 'editing a copy must not change the original example');
assert.notEqual(original.rounds[0].invested, copy.rounds[0].invested, 'editing a round copy must not change the original example');
assert.equal(findDefaultExample('clean-seed').startingOwnership.founder, 78, 'reset source should remain unchanged');

let mutationBlocked = false;
try {
  DEFAULT_EXAMPLES.push({ id: 'bad' });
} catch {
  mutationBlocked = true;
}
assert.equal(mutationBlocked, true, 'default example list should not be directly mutable');

console.log('Preset tests passed.');
