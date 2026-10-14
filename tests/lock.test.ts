import { describe, expect, it } from "vitest";
import {
  applyLockedClass,
  DEFAULT_STATE,
  LOCKED_CLASS,
  mustForceReading,
  parseState,
  toReadingState,
} from "../src/lock";

describe("parseState", () => {
  it("returns the persisted flag when valid", () => {
    expect(parseState({ locked: true })).toEqual({ locked: true });
    expect(parseState({ locked: false })).toEqual({ locked: false });
  });

  it.each([null, undefined, 42, "x", {}, { locked: "yes" }, { locked: 1 }])(
    "falls back to defaults for %j",
    (raw) => {
      expect(parseState(raw)).toBe(DEFAULT_STATE);
    },
  );
});

describe("mustForceReading", () => {
  it("forces Reading view only when locked and editing", () => {
    expect(mustForceReading(true, "source")).toBe(true);
    expect(mustForceReading(true, "preview")).toBe(false);
    expect(mustForceReading(false, "source")).toBe(false);
    expect(mustForceReading(false, "preview")).toBe(false);
  });
});

describe("toReadingState", () => {
  it("switches mode to preview and keeps the other fields without mutating the input", () => {
    const state = Object.freeze({ file: "a.md", mode: "source", source: false });
    expect(toReadingState(state)).toEqual({ file: "a.md", mode: "preview", source: false });
    expect(state.mode).toBe("source");
  });
});

describe("applyLockedClass", () => {
  function fakeBody(): HTMLElement {
    const classes = new Set<string>();
    const classList = {
      toggle: (name: string, force: boolean) => (force ? classes.add(name) : classes.delete(name)),
      contains: (name: string) => classes.has(name),
    };
    return { classList } as unknown as HTMLElement;
  }

  it("adds and removes the locked class", () => {
    const body = fakeBody();
    applyLockedClass(body, true);
    expect(body.classList.contains(LOCKED_CLASS)).toBe(true);
    applyLockedClass(body, false);
    expect(body.classList.contains(LOCKED_CLASS)).toBe(false);
  });
});
