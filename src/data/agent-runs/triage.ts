import type { AgentRunData } from './types';

/**
 * Correlation-ID triage on the fictional demo app ("Fourteener Transfers", *.fourteener.example).
 * All data is synthetic and matches the demo repo's seeded bug: a same-day transfer at 15:42 Mountain
 * time is wrongly treated as past the 16:00 America/Denver cut-off because CutoffPolicy.Evaluate
 * compares requestedAt.UtcDateTime (22:42Z) instead of business time.
 * Replace with trimmed text from a real run of the demo repo once it exists.
 */
export const triageRun: AgentRunData = {
  title: 'correlation-triage · Copilot Chat',
  note: 'Illustrative run on a fictional demo app. Synthetic data.',
  lines: [
    { kind: 'prompt', text: 'triage 7f3c9a2e-5b1d-4c8a-9e55-2a6f0c1d7b34' },
    { kind: 'step', text: 'reading context: transfers-api, ledger-api' },
    { kind: 'tool', label: 'search_logs', text: 'correlationId="7f3c9a2e…" | sort @t' },
    { kind: 'result', text: 'timeline: 4 events across 2 services' },
    { kind: 'result', indent: true, text: '15:42:07  TransferRequested  sameDay=true' },
    { kind: 'result', indent: true, text: '15:42:07  CutoffEvaluated    afterCutoff=true' },
    { kind: 'result', indent: true, text: '15:42:08  ledger-api  409 EFFECTIVE_DATE_MISMATCH' },
    { kind: 'result', indent: true, text: '15:42:08  transfers-api  502 to client' },
    { kind: 'step', text: 'mapping to code: Transfers.Api/Scheduling/CutoffPolicy.cs' },
    { kind: 'step', text: 'regression: "Refactor cut-off evaluation…" (v1.4.0)' },
    {
      kind: 'conclusion',
      label: 'likely cause',
      text: 'cut-off compared in UTC (22:42Z), not Denver business time',
    },
    { kind: 'gate', text: 'needs your approval before handing to delivery', actions: ['Approve', 'Edit'] },
  ],
};
