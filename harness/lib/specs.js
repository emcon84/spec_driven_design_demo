import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

export const STATUSES = ['idea', 'draft', 'approved', 'planned', 'in_progress', 'review', 'done'];
export const BLOCKED = 'blocked';

const SPEC_DIR = /^(\d{3})-[a-z0-9-]+$/;
const AC_DEFINITION = /^\s*-\s+\*\*(AC-\d+)\*\*/gm;
const AC_REFERENCE = /\[(AC-\d+)\]/g;
const AC_MENTION = /\bAC-\d+\b/g;
const TASK_LINE = /^\s*-\s+\[( |x|X)\]\s+\*\*(T\d+)\b/gm;
const OPEN_QUESTION = /^\s*-\s+\[ \]\s+\S.*$/gm;
const IGNORED_DIRS = new Set(['node_modules', '.git', '.venv', 'venv', '__pycache__', 'dist', 'build']);

export const statusIndex = (status) => STATUSES.indexOf(status);
export const acNumber = (ac) => Number(ac.split('-')[1]);

export function loadConfig(root) {
  const path = join(root, 'harness.config.json');
  if (!existsSync(path)) throw new Error('falta harness.config.json en la raíz del proyecto');
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { data: null, body: text };
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const sep = line.indexOf(':');
    if (sep > 0) data[line.slice(0, sep).trim()] = line.slice(sep + 1).trim();
  }
  return { data, body: text.slice(match[0].length) };
}

export function withFrontmatter(text, fields) {
  const { data, body } = parseFrontmatter(text);
  const merged = { ...data, ...fields };
  const lines = Object.entries(merged).map(([key, value]) => `${key}: ${value ?? ''}`.trimEnd());
  return `---\n${lines.join('\n')}\n---\n${body}`;
}

function section(body, title) {
  const lines = body.split(/\r?\n/);
  const start = lines.findIndex((line) => new RegExp(`^##\\s+(\\d+\\.\\s*)?${title}`, 'i').test(line));
  if (start === -1) return '';
  const end = lines.findIndex((line, i) => i > start && /^##\s/.test(line));
  return lines.slice(start + 1, end === -1 ? undefined : end).join('\n');
}

function readIfExists(path) {
  return existsSync(path) ? readFileSync(path, 'utf8') : null;
}

function loadSpec(specsDir, name) {
  const dir = join(specsDir, name);
  const specPath = join(dir, 'spec.md');
  const text = readFileSync(specPath, 'utf8');
  const { data, body } = parseFrontmatter(text);
  const tasksText = readIfExists(join(dir, 'tasks.md'));

  return {
    id: name.slice(0, 3),
    name,
    dir,
    specPath,
    text,
    frontmatter: data,
    title: data?.title || name,
    status: data?.status || null,
    approvedBy: data?.approved_by || null,
    acs: [...body.matchAll(AC_DEFINITION)].map((m) => m[1]),
    openQuestions: [...section(body, 'Preguntas abiertas').matchAll(OPEN_QUESTION)].map((m) => m[0].trim()),
    hasPlan: existsSync(join(dir, 'plan.md')),
    tasks: tasksText ? [...tasksText.matchAll(TASK_LINE)].map((m) => ({ id: m[2], done: m[1] !== ' ' })) : [],
    tasksAcMentions: new Set(tasksText?.match(AC_MENTION) ?? []),
  };
}

export function loadSpecs({ specsDir }) {
  if (!existsSync(specsDir)) return [];
  return readdirSync(specsDir)
    .filter((name) => SPEC_DIR.test(name) && existsSync(join(specsDir, name, 'spec.md')))
    .sort()
    .map((name) => loadSpec(specsDir, name));
}

function walk(dir, extensions, files = []) {
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir)) {
    if (IGNORED_DIRS.has(entry)) continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path, extensions, files);
    else if (extensions.includes(extname(entry))) files.push(path);
  }
  return files;
}

export function collectTestRefs({ tests }) {
  const refs = new Map();
  for (const dir of tests.dirs) {
    for (const file of walk(dir, tests.extensions)) {
      for (const [, ac] of readFileSync(file, 'utf8').matchAll(AC_REFERENCE)) {
        if (!refs.has(ac)) refs.set(ac, new Set());
        refs.get(ac).add(file);
      }
    }
  }
  return refs;
}

export function nextAcNumber(specs) {
  return Math.max(0, ...specs.flatMap((spec) => spec.acs.map(acNumber))) + 1;
}
