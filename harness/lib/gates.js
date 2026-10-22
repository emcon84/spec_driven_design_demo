import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { STATUSES, BLOCKED, statusIndex } from './specs.js';

export const reviewPath = (progressDir, spec) => join(progressDir, `review_${spec.id}.md`);

// Each status implies every condition of the statuses before it.
export function gateProblems(spec, target, { specs, testRefs, progressDir }) {
  const problems = [];
  if (!spec.frontmatter) return ['spec.md has no frontmatter (--- id/title/status ---)'];
  if (target === BLOCKED) return problems;
  if (!STATUSES.includes(target)) return [`unknown status "${target}"`];

  const reached = (status) => statusIndex(target) >= statusIndex(status);

  if (reached('approved')) {
    if (spec.acs.length === 0) problems.push('has no acceptance criteria (- **AC-n** — ...)');
    if (spec.openQuestions.length > 0) {
      problems.push(`has ${spec.openQuestions.length} unresolved open question(s) in the "Open questions" section`);
    }
    if (!spec.approvedBy) problems.push('missing approved_by: a human approves with `harness move <id> approved --by <name>`');
  }

  if (reached('planned')) {
    if (!spec.hasPlan) problems.push('missing plan.md (`harness plan <id>` creates it from the template)');
    if (spec.tasks.length === 0) problems.push('tasks.md is missing or has no tasks (- [ ] **T1 — ...**)');
    const withoutTask = spec.acs.filter((ac) => !spec.tasksAcMentions.has(ac));
    if (withoutTask.length > 0) problems.push(`criteria with no task in tasks.md: ${withoutTask.join(', ')}`);
  }

  if (target === 'in_progress') {
    const others = specs.filter((other) => other.id !== spec.id && other.status === 'in_progress');
    if (others.length > 0) problems.push(`only one spec can be in_progress and ${others.map((o) => o.id).join(', ')} already is`);
  }

  if (reached('review')) {
    const pending = spec.tasks.filter((task) => !task.done).map((task) => task.id);
    if (pending.length > 0) problems.push(`unfinished tasks: ${pending.join(', ')}`);
    const untested = spec.acs.filter((ac) => !testRefs.has(ac));
    if (untested.length > 0) problems.push(`criteria with no tests ([AC-n] in the test name): ${untested.join(', ')}`);
  }

  if (reached('done')) {
    const path = reviewPath(progressDir, spec);
    const approved = existsSync(path) && /Verdict:\**\s*APPROVED/.test(readFileSync(path, 'utf8'));
    if (!approved) problems.push(`missing approved review in ${path} (with "**Verdict:** APPROVED")`);
  }

  return problems;
}

export function canTransition(from, to) {
  if (to === BLOCKED || from === BLOCKED) return true;
  return statusIndex(to) <= statusIndex(from) + 1;
}

export function nextAction(spec, progressDir) {
  switch (spec.status) {
    case 'idea': return 'spec-writer: turn the idea into a complete spec → draft';
    case 'draft': return spec.openQuestions.length > 0
      ? `human: answer ${spec.openQuestions.length} open question(s)`
      : 'human: review and approve (`harness move <id> approved --by <name>`)';
    case 'approved': return 'planner: `harness plan <id>` and complete plan.md + tasks.md → planned';
    case 'planned': return 'leader: `harness move <id> in_progress` and launch the implementer';
    case 'in_progress': {
      const task = spec.tasks.find((t) => !t.done);
      return task ? `implementer: task ${task.id}` : 'implementer: all done → `harness move <id> review`';
    }
    case 'review': return `reviewer: write ${reviewPath(progressDir, spec)} → done`;
    case 'done': return '—';
    case BLOCKED: return 'see progress/current.md';
    default: return 'fix the status in the frontmatter';
  }
}
