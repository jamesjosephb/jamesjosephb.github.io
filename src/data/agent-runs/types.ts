/** One line of a scripted agent transcript shown by <AgentRun>. */
export type AgentRunLine =
  /** What the engineer typed. Typed out character by character. */
  | { kind: 'prompt'; text: string }
  /** The agent narrating a step (dim). */
  | { kind: 'step'; text: string }
  /** A tool call or query the agent ran. */
  | { kind: 'tool'; label: string; text: string }
  /** A result line; `indent` for sub-items such as timeline events. */
  | { kind: 'result'; text: string; indent?: boolean }
  /** The conclusion, highlighted with the signal colour. */
  | { kind: 'conclusion'; label: string; text: string }
  /** A human approval gate, shown in the gate colour with decorative action chips. */
  | { kind: 'gate'; text: string; actions?: string[] };

export interface AgentRunData {
  /** Shown in the window chrome, e.g. the agent's name. */
  title: string;
  /** Short note under the widget saying where the data comes from. */
  note: string;
  lines: AgentRunLine[];
}
