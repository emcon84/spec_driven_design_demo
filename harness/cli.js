#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
  STATUSES, BLOCKED, loadConfig, loadSpecs, collectTestRefs, withFrontmatter, nextAcNumber, acNumber,
} from './lib/specs.js';
import { gateProblems, canTransition, nextAction } from './lib/gates.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
process.chdir(ROOT);

const color = (code) => (text) => (process.stdout.isTTY ? `\x1b[${code}m${text}\x1b[0m` : text);
const green = color('32');
const red = color('31');
const yellow = color('33');
const dim = color('2');
const ok = (msg) => console.log(`${green('[OK]')}    ${msg}`);
const warn = (msg) => console.log(`${yellow('[WARN]')}  ${msg}`);
const fail = (msg) => console.log(`${red('[FAIL]')}  ${msg}`);
const heading = (title) => console.log(`\n── ${title} ${'─'.repeat(Math.max(0, 50 - title.length))}`);

function die(message) {
  console.error(red(message));
  process.exit(1);
}

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
      flags[key] = value;
    } else {
      positional.push(argv[i]);
    }
  }
  return { positional, flags };
}

function context() {
  const config = loadConfig(ROOT);
  const specs = loadSpecs(config);
  return { config, specs, testRefs: collectTestRefs(config), progressDir: config.progressDir };
}

function findSpec(specs, id) {
  const spec = specs.find((s) => s.id === String(id).padStart(3, '0') || s.name === id);
  if (!spec) die(`no existe la spec "${id}". Specs: ${specs.map((s) => s.id).join(', ') || '(ninguna)'}`);
  return spec;
}

function fillTemplate(templatePath, values) {
  let text = readFileSync(templatePath, 'utf8');
  for (const [key, value] of Object.entries(values)) text = text.replaceAll(`{{${key}}}`, value);
  return text;
}

function slugify(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    .split('-').slice(0, 5).join('-');
}

function runVerify(config, { verbose = false } = {}) {
  if (!config.verify?.length) {
    warn('no hay comandos en harness.config.json → verify (agregá tests/lint cuando exista código)');
    return true;
  }
  let allPassed = true;
  for (const step of config.verify) {
    const result = spawnSync(step.run, { shell: true, encoding: 'utf8' });
    const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trimEnd();
    if (result.status === 0) {
      ok(`${step.name} (${step.run})`);
      if (verbose) console.log(dim(output));
    } else {
      fail(`${step.name} (${step.run}) → exit ${result.status}`);
      console.log(dim(output.split('\n').slice(-30).join('\n')));
      allPassed = false;
    }
  }
  return allPassed;
}

// ── Comandos ────────────────────────────────────────────────────────────────

function cmdNew({ positional, flags }) {
  const idea = positional.join(' ').trim();
  if (!idea) die('uso: harness new "<idea en una o dos frases>" [--title "Título"]');

  const { config, specs } = context();
  const title = typeof flags.title === 'string' ? flags.title : idea.split(/[.\n]/)[0].slice(0, 60);
  const id = String(Math.max(0, ...specs.map((s) => Number(s.id))) + 1).padStart(3, '0');
  const dir = join(config.specsDir, `${id}-${slugify(title) || 'spec'}`);

  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'spec.md'), fillTemplate(join(config.templatesDir, 'spec.md'), {
    id, title, idea, date: new Date().toISOString().slice(0, 10),
  }));

  console.log(`${green('✔')} Creada ${join(dir, 'spec.md')} (status: idea)`);
  console.log(`  Primer ID de criterio libre: AC-${nextAcNumber(specs)}`);
  console.log(`  Próximo paso: spec-writer (harness/agents/spec-writer.md) → draft`);
}

function cmdPlan({ positional }) {
  const { config, specs } = context();
  const spec = findSpec(specs, positional[0]);
  const values = { id: spec.id, title: spec.title };
  for (const file of ['plan.md', 'tasks.md']) {
    const target = join(spec.dir, file);
    if (existsSync(target)) {
      console.log(`${yellow('·')} ${target} ya existe, no se toca`);
    } else {
      writeFileSync(target, fillTemplate(join(config.templatesDir, file), values));
      console.log(`${green('✔')} Creado ${target}`);
    }
  }
}

function cmdStatus() {
  const { specs, testRefs, progressDir } = context();
  if (specs.length === 0) return console.log('No hay specs. Empezá con: harness new "<idea>"');

  console.log('');
  for (const spec of specs) {
    const tested = spec.acs.filter((ac) => testRefs.has(ac)).length;
    const done = spec.tasks.filter((t) => t.done).length;
    console.log(`${spec.id}  ${spec.title}`);
    console.log(dim(`     estado: ${spec.status}   ACs con test: ${tested}/${spec.acs.length}   tareas: ${done}/${spec.tasks.length}`));
    console.log(`     siguiente → ${nextAction(spec, progressDir).replace('<id>', spec.id)}\n`);
  }
  console.log(dim(`Próximo ID de criterio libre: AC-${nextAcNumber(specs)}`));
}

function cmdMove({ positional, flags }) {
  const [id, target] = positional;
  if (!id || !target) die(`uso: harness move <id> <${[...STATUSES, BLOCKED].join('|')}> [--by <nombre>] [--reason "<motivo>"]`);
  if (![...STATUSES, BLOCKED].includes(target)) die(`estado inválido "${target}"`);

  const ctx = context();
  const spec = findSpec(ctx.specs, id);
  if (!canTransition(spec.status, target)) {
    die(`no se puede saltar de ${spec.status} a ${target}. Siguiente estado posible: ${STATUSES[STATUSES.indexOf(spec.status) + 1]}`);
  }

  const fields = { status: target };
  if (target === 'approved') {
    if (typeof flags.by !== 'string') die('aprobar una spec requiere --by <nombre> (lo hace un humano, no un agente)');
    fields.approved_by = flags.by;
  } else if (target !== BLOCKED && STATUSES.indexOf(target) < STATUSES.indexOf('approved')) {
    fields.approved_by = '';
  }
  fields.blocked_reason = target === BLOCKED ? (typeof flags.reason === 'string' ? flags.reason : 'sin motivo') : '';

  const candidate = { ...spec, status: target, approvedBy: fields.approved_by ?? spec.approvedBy };
  const problems = gateProblems(candidate, target, ctx);

  if (['review', 'done'].includes(target) && problems.length === 0) {
    heading('Verificación');
    if (!runVerify(ctx.config)) problems.push('la verificación falla (ver arriba)');
  }

  if (problems.length > 0) {
    console.log(red(`\n✘ ${spec.id}: ${spec.status} → ${target} rechazado por la compuerta:`));
    for (const problem of problems) console.log(`   - ${problem}`);
    process.exit(1);
  }

  const cleaned = Object.fromEntries(Object.entries(fields).filter(([k, v]) => v !== '' || spec.frontmatter[k] !== undefined));
  writeFileSync(spec.specPath, withFrontmatter(spec.text, cleaned));
  console.log(`${green('✔')} ${spec.id}: ${spec.status} → ${target}`);
  console.log(`  siguiente → ${nextAction(candidate, ctx.progressDir).replace('<id>', spec.id)}`);
}

function traceReport({ specs, testRefs }) {
  const errors = [];
  const owner = new Map();
  for (const spec of specs) {
    for (const ac of spec.acs) {
      if (owner.has(ac)) errors.push(`${ac} está definido en ${owner.get(ac)} y en ${spec.id}`);
      owner.set(ac, spec.id);
    }
  }

  for (const spec of specs) {
    console.log(`\n  ${spec.id} ${spec.title} ${dim(`(${spec.status})`)}`);
    const mustBeTested = ['review', 'done'].includes(spec.status);
    for (const ac of [...spec.acs].sort((a, b) => acNumber(a) - acNumber(b))) {
      const files = testRefs.get(ac);
      if (files) console.log(`    ${green('✔')} ${ac}  ${dim([...files].join(', '))}`);
      else if (mustBeTested) { console.log(`    ${red('✘')} ${ac}  SIN TESTS`); errors.push(`${ac} (${spec.id}) no tiene tests`); }
      else console.log(`    ${yellow('○')} ${ac}  pendiente`);
    }
  }

  for (const [ac, files] of testRefs) {
    if (!owner.has(ac)) errors.push(`${ac} se usa en ${[...files].join(', ')} pero no existe en ninguna spec`);
  }
  return errors;
}

function cmdTrace() {
  const ctx = context();
  console.log('Trazabilidad spec → tests');
  const errors = traceReport(ctx);
  console.log('');
  errors.forEach(fail);
  if (errors.length === 0) ok('trazabilidad consistente');
  process.exit(errors.length ? 1 : 0);
}

function cmdCheck({ flags }) {
  const ctx = context();
  const { config, specs } = ctx;
  let healthy = true;

  heading('1. Archivos base del harness');
  for (const file of config.requiredFiles) {
    if (existsSync(file)) ok(file);
    else { fail(`falta ${file}`); healthy = false; }
  }

  heading('2. Estado de las specs');
  if (specs.length === 0) warn('no hay specs todavía');
  for (const spec of specs) {
    const problems = gateProblems(spec, spec.status, ctx);
    if (problems.length === 0) ok(`${spec.id} ${spec.title} [${spec.status}]`);
    else {
      fail(`${spec.id} ${spec.title} [${spec.status}] no cumple su estado:`);
      problems.forEach((p) => console.log(`         - ${p}`));
      healthy = false;
    }
  }

  heading('3. Trazabilidad spec → tests');
  const traceErrors = traceReport(ctx);
  console.log('');
  traceErrors.forEach(fail);
  if (traceErrors.length === 0) ok('trazabilidad consistente');
  else healthy = false;

  if (!flags.fast) {
    heading('4. Verificación ejecutable');
    if (!runVerify(config, { verbose: Boolean(flags.verbose) })) healthy = false;
  }

  heading('Resumen');
  if (healthy) ok('Harness en verde. Se puede trabajar / cerrar la sesión.');
  else fail('Harness en rojo. Resolvé lo de arriba (o documentá el bloqueo en progress/current.md).');
  process.exit(healthy ? 0 : 1);
}

function cmdNextAc() {
  console.log(`AC-${nextAcNumber(context().specs)}`);
}

const COMMANDS = {
  new: [cmdNew, 'new "<idea>" [--title "..."]', 'crea specs/NNN-slug/spec.md en estado idea'],
  plan: [cmdPlan, 'plan <id>', 'crea plan.md y tasks.md desde las plantillas'],
  status: [cmdStatus, 'status', 'estado de cada spec y el siguiente paso'],
  move: [cmdMove, 'move <id> <estado> [--by <nombre>]', 'cambia de estado si pasa la compuerta'],
  check: [cmdCheck, 'check [--fast] [--verbose]', 'verificación completa (usar al empezar y al cerrar)'],
  trace: [cmdTrace, 'trace', 'solo trazabilidad AC ↔ tests'],
  'next-ac': [cmdNextAc, 'next-ac', 'próximo ID de criterio libre'],
};

const [command, ...rest] = process.argv.slice(2);
if (!COMMANDS[command]) {
  console.log('harness — Spec-Driven Design harness\n\nComandos:');
  for (const [, usage, description] of Object.values(COMMANDS)) console.log(`  ${usage.padEnd(40)} ${dim(description)}`);
  console.log(`\nCiclo de vida: ${STATUSES.join(' → ')}  (y ${BLOCKED} en cualquier momento)`);
  process.exit(command ? 1 : 0);
}
COMMANDS[command][0](parseArgs(rest));
