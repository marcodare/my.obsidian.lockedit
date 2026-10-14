import type { MarkdownViewModeType } from "obsidian";

export const LOCKED_CLASS = "my-obsidian-lockedit-locked";

export interface PluginState {
  readonly locked: boolean;
}

export const DEFAULT_STATE: PluginState = { locked: false };

/** Validates persisted data at the boundary; anything malformed falls back to defaults. */
export function parseState(raw: unknown): PluginState {
  if (typeof raw === "object" && raw !== null && "locked" in raw) {
    const { locked } = raw as { locked: unknown };
    if (typeof locked === "boolean") return { locked };
  }
  return DEFAULT_STATE;
}

/** A Markdown view must be pushed back to Reading view when the lock is on and it is editing. */
export function mustForceReading(locked: boolean, mode: MarkdownViewModeType): boolean {
  return locked && mode !== "preview";
}

/** Returns a copy of a Markdown view state switched to Reading view. */
export function toReadingState(state: Record<string, unknown>): Record<string, unknown> {
  return { ...state, mode: "preview" };
}

export function applyLockedClass(body: HTMLElement, locked: boolean): void {
  body.classList.toggle(LOCKED_CLASS, locked);
}
