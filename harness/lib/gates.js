import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { STATUSES, BLOCKED, statusIndex } from './specs.js';

export const reviewPath = (progressDir, spec) => join(progressDir, `review_${spec.id}.md`);

// Each status implies every condition of the statuses before it.
export function gateProblems(spec, target, { specs, testRefs, progressDir }) {
  const problems = [];
  if (!spec.frontmatter) return ['spec.md no tiene frontmatter (--- id/title/status ---)'];
  if (target === BLOCKED) return problems;
  if (!STATUSES.includes(target)) return [`estado desconocido "${target}"`];

  const reached = (status) => statusIndex(target) >= statusIndex(status);

  if (reached('approved')) {
    if (spec.acs.length === 0) problems.push('no tiene criterios de aceptación (- **AC-n** — ...)');
    if (spec.openQuestions.length > 0) {
      problems.push(`tiene ${spec.openQuestions.length} pregunta(s) abierta(s) sin resolver en la sección "Preguntas abiertas"`);
    }
    if (!spec.approvedBy) problems.push('falta approved_by: la aprueba un humano con `harness move <id> approved --by <nombre>`');
  }

  if (reached('planned')) {
    if (!spec.hasPlan) problems.push('falta plan.md (`harness plan <id>` lo crea desde la plantilla)');
    if (spec.tasks.length === 0) problems.push('tasks.md no existe o no tiene tareas (- [ ] **T1 — ...**)');
    const withoutTask = spec.acs.filter((ac) => !spec.tasksAcMentions.has(ac));
    if (withoutTask.length > 0) problems.push(`criterios sin tarea en tasks.md: ${withoutTask.join(', ')}`);
  }

  if (target === 'in_progress') {
    const others = specs.filter((other) => other.id !== spec.id && other.status === 'in_progress');
    if (others.length > 0) problems.push(`solo puede haber una spec en in_progress y ya está ${others.map((o) => o.id).join(', ')}`);
  }

  if (reached('review')) {
    const pending = spec.tasks.filter((task) => !task.done).map((task) => task.id);
    if (pending.length > 0) problems.push(`tareas sin terminar: ${pending.join(', ')}`);
    const untested = spec.acs.filter((ac) => !testRefs.has(ac));
    if (untested.length > 0) problems.push(`criterios sin tests ([AC-n] en el nombre del test): ${untested.join(', ')}`);
  }

  if (reached('done')) {
    const path = reviewPath(progressDir, spec);
    const approved = existsSync(path) && /Veredicto:\**\s*APPROVED/.test(readFileSync(path, 'utf8'));
    if (!approved) problems.push(`falta la revisión aprobada en ${path} (con "**Veredicto:** APPROVED")`);
  }

  return problems;
}

export function canTransition(from, to) {
  if (to === BLOCKED || from === BLOCKED) return true;
  return statusIndex(to) <= statusIndex(from) + 1;
}

export function nextAction(spec, progressDir) {
  switch (spec.status) {
    case 'idea': return 'spec-writer: convertir la idea en una spec completa → draft';
    case 'draft': return spec.openQuestions.length > 0
      ? `humano: responder ${spec.openQuestions.length} pregunta(s) abierta(s)`
      : 'humano: revisar y aprobar (`harness move <id> approved --by <nombre>`)';
    case 'approved': return 'planner: `harness plan <id>` y completar plan.md + tasks.md → planned';
    case 'planned': return 'leader: `harness move <id> in_progress` y lanzar implementer';
    case 'in_progress': {
      const task = spec.tasks.find((t) => !t.done);
      return task ? `implementer: tarea ${task.id}` : 'implementer: todo hecho → `harness move <id> review`';
    }
    case 'review': return `reviewer: escribir ${reviewPath(progressDir, spec)} → done`;
    case 'done': return '—';
    case BLOCKED: return 'ver progress/current.md';
    default: return 'corregir el status en el frontmatter';
  }
}
