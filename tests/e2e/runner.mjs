#!/usr/bin/env node
// @ts-check
import fs from 'fs';
import path from 'path';
import { tier1Tests } from './tier1-feature-coverage.test.mjs';
import { tier2Tests } from './tier2-boundary-corner.test.mjs';
import { tier3Tests } from './tier3-pairwise.test.mjs';
import { tier4Tests } from './tier4-workload-scenarios.test.mjs';
import { tier5Tests } from './tier5-adversarial-hardening.test.mjs';

const ROOT_DIR = path.resolve(process.cwd());
const RESULTS_FILE = path.join(ROOT_DIR, 'tests', 'e2e', 'test-results.json');

// Parse CLI flags
const args = process.argv.slice(2);
let targetTier = null;
let targetFeature = null;
let filterQuery = null;

for (const arg of args) {
  if (arg.startsWith('--tier=')) {
    targetTier = parseInt(arg.split('=')[1], 10);
  } else if (arg.startsWith('--feature=')) {
    targetFeature = parseInt(arg.split('=')[1], 10);
  } else if (arg.startsWith('--filter=')) {
    filterQuery = arg.split('=')[1].toLowerCase();
  }
}

console.log('='.repeat(78));
console.log('   CORDONNERIE LE MILLOT — SUITE DE TESTS E2E OPAQUE-BOX (TIERS 1-5)');
console.log('='.repeat(78));
console.log(`Node version: ${process.version}`);
console.log(`Working directory: ${ROOT_DIR}`);
if (targetTier) console.log(`Filtre actif : Tier ${targetTier}`);
if (targetFeature) console.log(`Filtre actif : Feature ${targetFeature}`);
if (filterQuery) console.log(`Filtre actif : Mot-clé "${filterQuery}"`);
console.log('-'.repeat(78));

const tiers = [
  { tier: 1, name: 'Tier 1: Couverture Fonctionnelle (Category-Partition)', tests: tier1Tests },
  { tier: 2, name: 'Tier 2: Limites et Cas d\'Angle (Boundary Value Analysis)', tests: tier2Tests },
  { tier: 3, name: 'Tier 3: Combinaisons Croisées (Pairwise Interactions)', tests: tier3Tests },
  { tier: 4, name: 'Tier 4: Scénarios Métier Réels (Workload Scenarios)', tests: tier4Tests },
  { tier: 5, name: 'Tier 5: Durcissement Contradictoire (Adversarial Hardening)', tests: tier5Tests }
];

async function runTestSuite() {
  const startTime = Date.now();
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  let skippedTests = 0;

  const results = {
    timestamp: new Date().toISOString(),
    summary: { total: 0, passed: 0, failed: 0, skipped: 0, durationMs: 0 },
    tiers: {},
    failures: []
  };

  for (const t of tiers) {
    if (targetTier && t.tier !== targetTier) {
      continue;
    }

    console.log(`\n\x1b[1m\x1b[36m▶ ${t.name}\x1b[0m`);
    let tierPassed = 0;
    let tierFailed = 0;
    let tierSkipped = 0;

    for (const test of t.tests) {
      // Apply feature filter if specified
      if (targetFeature && test.feature && test.feature !== targetFeature) {
        tierSkipped++;
        skippedTests++;
        continue;
      }

      // Apply query filter if specified
      if (filterQuery && !test.name.toLowerCase().includes(filterQuery) && !test.id.toLowerCase().includes(filterQuery)) {
        tierSkipped++;
        skippedTests++;
        continue;
      }

      totalTests++;
      const testStart = Date.now();
      try {
        await test.fn();
        const duration = Date.now() - testStart;
        tierPassed++;
        passedTests++;
        console.log(`  \x1b[32m✔\x1b[0m [${test.id}] ${test.name} \x1b[90m(${duration}ms)\x1b[0m`);
      } catch (err) {
        const duration = Date.now() - testStart;
        tierFailed++;
        failedTests++;
        console.error(`  \x1b[31m✖ [${test.id}] ${test.name} (${duration}ms)\x1b[0m`);
        console.error(`    \x1b[31mError: ${err.message}\x1b[0m`);
        results.failures.push({
          id: test.id,
          name: test.name,
          error: err.message,
          stack: err.stack
        });
      }
    }

    results.tiers[`tier${t.tier}`] = {
      name: t.name,
      total: tierPassed + tierFailed,
      passed: tierPassed,
      failed: tierFailed,
      skipped: tierSkipped
    };
  }

  const durationMs = Date.now() - startTime;
  results.summary = {
    total: totalTests,
    passed: passedTests,
    failed: failedTests,
    skipped: skippedTests,
    durationMs
  };

  // Ensure tests/e2e/ directory exists for results file
  const resultsDir = path.dirname(RESULTS_FILE);
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2), 'utf8');

  console.log('\n' + '='.repeat(78));
  console.log('                            RÉSUMÉ DU TEST RUN');
  console.log('='.repeat(78));
  console.log(`Total exécuté : ${totalTests}`);
  console.log(`\x1b[32mSuccès        : ${passedTests}\x1b[0m`);
  if (failedTests > 0) {
    console.log(`\x1b[31mÉchecs        : ${failedTests}\x1b[0m`);
  } else {
    console.log(`Échecs        : 0`);
  }
  if (skippedTests > 0) {
    console.log(`Ignorés       : ${skippedTests}`);
  }
  console.log(`Durée totale  : ${durationMs} ms`);
  console.log(`Rapport JSON  : ${RESULTS_FILE}`);
  console.log('='.repeat(78));

  if (failedTests > 0) {
    console.error(`\x1b[31mSuite terminée avec ${failedTests} échec(s).\x1b[0m`);
    process.exit(1);
  } else {
    console.log(`\x1b[32mTOUS LES TESTS SONT AU VERT (100% de succès).\x1b[0m\n`);
    process.exit(0);
  }
}

runTestSuite().catch(err => {
  console.error('Erreur fatale du test runner:', err);
  process.exit(1);
});
