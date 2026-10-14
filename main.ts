import { MarkdownView, Plugin, setIcon } from "obsidian";
import {
  applyLockedClass,
  DEFAULT_STATE,
  mustForceReading,
  parseState,
  toReadingState,
  type PluginState,
} from "./src/lock";

const ICON_LOCKED = "lock";
const ICON_UNLOCKED = "unlock";
const TITLE_LOCKED = "Editing locked — tap to unlock";
const TITLE_UNLOCKED = "Editing unlocked — tap to lock";
const BUTTON_CLASS = "my-obsidian-lockedit-button";

export default class MyObsidianLockEditPlugin extends Plugin {
  private state: PluginState = DEFAULT_STATE;
  private ribbonEl: HTMLElement | null = null;
  private readonly actionEls = new Map<MarkdownView, HTMLElement>();
  /** Views with a pending switch to Reading view, so re-entrant events don't stack calls. */
  private readonly switching = new WeakSet<MarkdownView>();

  override async onload(): Promise<void> {
    this.state = parseState(await this.loadData());

    this.ribbonEl = this.addRibbonIcon(ICON_UNLOCKED, TITLE_UNLOCKED, () => void this.toggle());
    this.addCommand({
      id: "toggle-edit-lock",
      name: "Toggle edit lock",
      callback: () => void this.toggle(),
    });

    // Mode switches (header button, Ctrl/Cmd+E, mobile edit button) and newly opened notes all
    // surface as one of these events; each one re-applies the lock.
    this.registerEvent(this.app.workspace.on("layout-change", () => this.sync()));
    this.registerEvent(this.app.workspace.on("active-leaf-change", () => this.sync()));
    this.registerEvent(this.app.workspace.on("file-open", () => this.sync()));
    this.registerEvent(
      this.app.workspace.on("window-open", (_win, window) =>
        applyLockedClass(window.document.body, this.state.locked),
      ),
    );
    this.app.workspace.onLayoutReady(() => this.render());
  }

  override onunload(): void {
    this.forEachBody((body) => applyLockedClass(body, false));
    for (const el of this.actionEls.values()) el.remove();
    this.actionEls.clear();
  }

  private async toggle(): Promise<void> {
    this.state = { locked: !this.state.locked };
    this.render();
    await this.saveData(this.state);
  }

  private render(): void {
    this.forEachBody((body) => applyLockedClass(body, this.state.locked));
    if (this.ribbonEl) this.updateButton(this.ribbonEl);
    this.sync();
  }

  /** Enforces Reading view and keeps a lock button in the header of every Markdown view. */
  private sync(): void {
    for (const [view, el] of this.actionEls) {
      if (!el.isConnected) this.actionEls.delete(view);
    }

    this.app.workspace.iterateAllLeaves((leaf) => {
      const view = leaf.view;
      if (!(view instanceof MarkdownView)) return;
      if (!this.actionEls.has(view)) {
        this.actionEls.set(
          view,
          view.addAction(ICON_UNLOCKED, TITLE_UNLOCKED, () => void this.toggle()),
        );
      }
      if (mustForceReading(this.state.locked, view.getMode())) void this.forceReading(view);
    });

    for (const el of this.actionEls.values()) this.updateButton(el);
  }

  private async forceReading(view: MarkdownView): Promise<void> {
    if (this.switching.has(view)) return;
    this.switching.add(view);
    try {
      await view.setState(toReadingState(view.getState()), { history: false });
    } finally {
      this.switching.delete(view);
    }
  }

  private forEachBody(fn: (body: HTMLElement) => void): void {
    fn(document.body);
    this.app.workspace.iterateAllLeaves((leaf) => fn(leaf.view.containerEl.ownerDocument.body));
  }

  private updateButton(el: HTMLElement): void {
    const { locked } = this.state;
    setIcon(el, locked ? ICON_LOCKED : ICON_UNLOCKED);
    el.setAttribute("aria-label", locked ? TITLE_LOCKED : TITLE_UNLOCKED);
    el.classList.add(BUTTON_CLASS);
    el.classList.toggle("is-active", locked);
  }
}
