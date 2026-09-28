#!/usr/bin/env node
/**
 * Verifies that the wrapper packages type-check against every framework
 * version declared in their peer ranges, using a clean-room consumer project.
 *
 * The use case: the wrappers are compiled with the *latest* toolchain for the
 * demo/Storybook builds (security posture), but published with peer ranges that
 * span the supported framework versions. This script proves those peer ranges
 * are real by installing the packed tarballs (stencil + wrapper built from the
 * current tree) together with a specific framework version into a throw-away
 * consumer project, then running `tsc --noEmit` on a consumer sample that uses
 * the wrapper's public API.
 *
 * Usage:
 *   node scripts/verify-framework-compat.js            # run every supported leg
 *   node scripts/verify-framework-compat.js react 18   # run a single leg
 *
 * Environment:
 *   KEEP_TMP=1          keep the temporary consumer directory for inspection
 *   TS_VERSION          override the TypeScript version used by every leg
 *   PREBUILT_TARBALLS   directory containing pre-packed tarballs (used by CI to
 *                       skip the `npm pack` step in the split build/verify jobs)
 *
 * The consumer project is type-checked with full checking (no skipLibCheck) so
 * that errors inside published .d.ts files surface. Angular < 22 requires TS <
 * 6.0, so those legs use an in-range TS by default (see TS_BY_LEG); everything
 * else uses the current latest.
 *
 * Prerequisite: `npm run build` must have been run so that
 * `packages/stencil-library/dist` and `packages/*-library/dist` exist.
 */
'use strict';

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

const STENCIL_PKG = 'packages/stencil-library';
const STENCIL_PACKAGE_NAME = '@kit-data-manager/pid-component';

// Default legs, used when no framework/version arguments are passed. The CI
// workflow (framework-compat.yml) declares the same legs inline in its matrix.
const LEGS = [
  { framework: 'angular', consumer: '20' },
  { framework: 'angular', consumer: '21' },
  { framework: 'angular', consumer: '22' },
  { framework: 'react', consumer: '18' },
  { framework: 'react', consumer: '19' },
  { framework: 'vue', consumer: '3' },
];

// Default TypeScript version per leg. Angular < 22 only supports TS < 6.0
// (see @angular/compiler-cli peer ranges), so we pin an in-range TS for those
// legs to reflect the pairing a real consumer can actually use. Everything else
// uses the current latest, and TS_VERSION overrides everything.
const DEFAULT_TS = '6.0.3';
const TS_BY_LEG = {
  'angular@20': '~5.8',
  'angular@21': '~5.9',
  'angular@22': '~6.0',
};

function tsForLeg(leg) {
  const key = `${leg.framework}@${leg.consumer}`;
  return process.env.TS_VERSION || TS_BY_LEG[key] || DEFAULT_TS;
}

const WRAPPERS = {
  angular: {
    dir: 'packages/angular-library',
    packageName: '@kit-data-manager/angular-pid-component',
    deps: v => [`@angular/core@^${v}`],
    source: 'consumer.ts',
    sourceText: `
import { Component } from '@angular/core';
import { PidComponent } from '@kit-data-manager/angular-pid-component';

@Component({
  selector: 'compat-consumer',
  imports: [PidComponent],
  template: '<pid-component value="10.5072/12345"></pid-component>',
})
export class ConsumerComponent {}
`,
  },
  react: {
    dir: 'packages/react-library',
    packageName: '@kit-data-manager/react-pid-component',
    deps: v => [`react@^${v}`, `react-dom@^${v}`, `@types/react@^${v}`, `@types/react-dom@^${v}`],
    source: 'consumer.tsx',
    sourceText: `
import { PidComponent } from '@kit-data-manager/react-pid-component';

export function Consumer() {
  return <PidComponent value="10.5072/12345" />;
}
`,
  },
  vue: {
    dir: 'packages/vue-library',
    packageName: '@kit-data-manager/vue-pid-component',
    deps: () => ['vue@^3.0.0', 'vue-router@^4'],
    source: 'consumer.ts',
    sourceText: `
import { defineComponent } from 'vue';
import { PidComponent } from '@kit-data-manager/vue-pid-component';

export const Consumer = defineComponent({
  name: 'compat-consumer',
  components: { PidComponent },
  template: '<pid-component value="10.5072/12345"></pid-component>',
});
`,
  },
};

function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, {
    cwd: opts.cwd || ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, ...opts.env },
  });
}

// Returns the packed tarball path for a package dir. When PREBUILT_TARBALLS is
// set (CI split build/verify), it reuses a tarball packed by the earlier build
// job instead of packing again, so the verify job does not need the monorepo.
function pack(dir, dest, packageName) {
  const prebuiltDir = process.env.PREBUILT_TARBALLS;
  if (prebuiltDir) {
    const name = packageName.replace('@', '').replace('/', '-');
    const tarball = fs.readdirSync(prebuiltDir).find(f => f.startsWith(name) && f.endsWith('.tgz'));
    if (!tarball) {
      throw new Error(`No prebuilt tarball for ${packageName} in ${prebuiltDir}`);
    }
    // Resolve to an absolute path: npm is later invoked with --prefix pointing at
    // a temp dir, so a relative tarball path would be resolved against that dir and
    // mistakenly interpreted as a git spec (e.g. tarballs/foo.tgz -> github...).
    return path.resolve(prebuiltDir, tarball);
  }
  const stdout = run('npm', ['pack', path.join(ROOT, dir), '--pack-destination', dest], { cwd: ROOT });
  const lines = stdout.trim().split('\n');
  const filename = lines[lines.length - 1].trim();
  if (!/\.tgz$/.test(filename)) {
    throw new Error(`Could not determine packed tarball name from output:\n${stdout}`);
  }
  return path.join(dest, filename);
}

function writeFile(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function consumerProject(tmp, leg) {
  const wrapper = WRAPPERS[leg.framework];
  fs.mkdirSync(tmp, { recursive: true });

  // minimal consumer package.json
  writeFile(path.join(tmp, 'package.json'), JSON.stringify({ name: 'framework-compat-consumer', private: true, version: '0.0.0' }, null, 2));

  // consumer source + tsconfig
  writeFile(path.join(tmp, 'src', wrapper.source), wrapper.sourceText.trimStart());
  writeFile(
    path.join(tmp, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          module: 'ESNext',
          moduleResolution: 'bundler',
          lib: ['ES2022', 'DOM', 'DOM.Iterable'],
          jsx: wrapper.source.endsWith('.tsx') ? 'react-jsx' : undefined,
          experimentalDecorators: wrapper.framework === 'angular',
          strict: true,
          noEmit: true,
          forceConsistentCasingInFileNames: true,
        },
        include: ['src'],
      },
      null,
      2,
    ),
  );
}

function install(tmp, tarballs, deps, tsVersion) {
  const args = ['install', '--prefix', tmp, '--no-audit', '--no-fund', '--ignore-scripts', ...tarballs, ...deps, `typescript@${tsVersion}`];
  return run('npm', args, { cwd: tmp });
}

function typeCheck(tmp) {
  const tsc = path.join(tmp, 'node_modules', 'typescript', 'bin', 'tsc');
  if (!fs.existsSync(tsc)) {
    throw new Error(`TypeScript not installed in consumer project (${tsc})`);
  }
  run('node', [tsc, '-p', path.join(tmp, 'tsconfig.json')], { cwd: tmp });
}

function verifyLeg(leg, keep) {
  const label = `${leg.framework}@${leg.consumer}`;
  const tsVersion = tsForLeg(leg);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `pid-compat-${label.replace('/', '-')}-`));
  try {
    const wrapper = WRAPPERS[leg.framework];
    const packs = path.join(tmp, 'packs');
    fs.mkdirSync(packs, { recursive: true });

    console.log(`  packing stencil + ${leg.framework} wrapper...`);
    const stencilTarball = pack(STENCIL_PKG, packs, STENCIL_PACKAGE_NAME);
    const wrapperTarball = pack(wrapper.dir, packs, wrapper.packageName);

    console.log(`  installing consumer with ${wrapper.packageName} + ${label} (TS ${tsVersion})...`);
    consumerProject(tmp, leg);
    install(tmp, [stencilTarball, wrapperTarball], wrapper.deps(leg.consumer), tsVersion);

    console.log(`  type-checking consumer project (tsc --noEmit)...`);
    typeCheck(tmp);
    console.log(`  PASS ${label}`);
    return true;
  } catch (err) {
    console.error(`  FAIL ${label}`);
    if (err.stdout) console.error(err.stdout);
    if (err.stderr) console.error(err.stderr);
    console.error(String(err.message || err));
    if (keep) console.error(`  keeping consumer project at ${tmp}`);
    return false;
  } finally {
    if (!keep) fs.rmSync(tmp, { recursive: true, force: true });
  }
}

function main() {
  const args = process.argv.slice(2);
  const keep = !!process.env.KEEP_TMP;

  let legs = LEGS;
  if (args.length === 2) {
    const [framework, consumer] = args;
    const match = LEGS.find(l => l.framework === framework && l.consumer === consumer);
    if (!match) {
      console.error(`Unknown leg "${framework} ${consumer}". Available legs:`);
      for (const l of LEGS) console.error(`  ${l.framework} ${l.consumer}`);
      process.exit(2);
    }
    legs = [match];
  } else if (args.length !== 0) {
    console.error('Usage: node scripts/verify-framework-compat.js [framework version]');
    process.exit(2);
  }

  console.log(`Verifying framework compatibility (TypeScript per leg; override with TS_VERSION)`);
  let failures = 0;
  for (const leg of legs) {
    if (!verifyLeg(leg, keep)) failures++;
  }
  if (failures > 0) {
    console.error(`\n${failures} of ${legs.length} framework-compatibility legs failed.`);
    process.exit(1);
  }
  console.log(`\nAll ${legs.length} framework-compatibility legs passed.`);
}

main();
