import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { cloneExample, findDefaultExample } from '../src/scenarios.js';

function createPageLifetime() {
  let savedScenarios = [];
  return {
    save(name, scenario) {
      const copy = cloneExample(scenario);
      copy.id = `saved-${savedScenarios.length + 1}`;
      copy.name = name;
      savedScenarios.push(copy);
      return copy;
    },
    all() {
      return savedScenarios;
    },
    clear() {
      savedScenarios = [];
    }
  };
}

const firstPage = createPageLifetime();
const edited = cloneExample(findDefaultExample('founder-zero'));
edited.startingOwnership.founder = 44;
firstPage.save('My rough case', edited);
assert.equal(firstPage.all().length, 1, 'saved scenario should exist during the current page lifetime');
assert.equal(firstPage.all()[0].startingOwnership.founder, 44);

const refreshedPage = createPageLifetime();
assert.equal(refreshedPage.all().length, 0, 'saved scenario should be gone after a new page lifetime begins');

const source = fs.readFileSync(path.join(process.cwd(), 'src/app.js'), 'utf8');
assert.equal(source.includes('localStorage'), false, 'app should not use browser durable saved scenarios');
assert.equal(source.includes('sessionStorage'), false, 'app should not use refresh-surviving saved scenarios');

console.log('Temporary saved scenario tests passed.');
