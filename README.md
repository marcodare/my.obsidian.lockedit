# My Obsidian Lock Edit

Obsidian plugin that prevents accidental switches to editing mode — handy on iPad and iPhone,
where a stray tap easily flips a note into the editor. While the lock is on, every Markdown note
stays in **Reading view**: any attempt to switch to editing (header button, `Cmd/Ctrl+E`, the
mobile edit button, opening a note in editing mode) is reverted immediately.

The lock is global and toggled from a lock icon in each note header, from the ribbon or from the
command palette (_Toggle edit lock_). The state is remembered across restarts.

- Task checkboxes stay clickable in Reading view (native Obsidian behaviour).
- Fully local: no network requests, telemetry or external services.
- Desktop, iPadOS and iOS.

## Installation

Development requirements: Node.js ≥ 21.2 and pnpm (version pinned in `package.json`;
`corepack enable` sets it up).

1. Point `.env` at your vault (not versioned; start from `.env.example`):

   ```bash
   cp .env.example .env
   # OBSIDIAN_VAULT_PATH=/absolute/path/to/vault   (the folder that contains .obsidian/)
   ```

2. Install dependencies, build and copy into the vault:

   ```bash
   pnpm install
   pnpm run install:vault
   ```

   The script builds and copies `main.js`, `manifest.json` and `styles.css` into
   `<VAULT>/.obsidian/plugins/my-obsidian-lockedit/`. If the path has no `.obsidian/` it stops
   with an error without creating anything.

3. In Obsidian: _Settings → Community plugins_ → reload the list → enable
   **My Obsidian Lock Edit**.

**Manual install** (no `.env`): after `pnpm build`, copy the three files into
`<VAULT>/.obsidian/plugins/my-obsidian-lockedit/`.

## Development

```bash
pnpm dev          # watch mode; copies every rebuild into the vault if .env is set
pnpm build        # type check + production bundle
pnpm test         # unit tests (vitest)
pnpm lint         # eslint
pnpm format       # prettier
```

| Path          | Contents                                            |
| ------------- | --------------------------------------------------- |
| `main.ts`     | Plugin entry: ribbon, command, header buttons, lock |
| `src/lock.ts` | State parsing and Reading-view enforcement helpers  |
| `styles.css`  | Accent colour for the lock buttons while locked     |
| `scripts/`    | Vault install helpers (`OBSIDIAN_VAULT_PATH`)       |
| `tests/`      | Unit tests                                          |

## License

MIT — see `LICENSE`.
