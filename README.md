# RusTODO

A tiny, fast todo list that lives on your desktop. Built with **Rust** and [Tauri v2](https://tauri.app) on the backend and plain vanilla JavaScript on the frontend — no framework, no network, no telemetry.

## Features

- **Quick capture** — type in the input, press Enter, done
- **Smart ordering** — checking an item moves it below all open items, with the most recently checked on top so you can see your progress; unchecking sends it back to the bottom of the open list
- **Inline editing** — double-click any item to edit its text in place (Enter/blur saves, Esc cancels)
- **Drag & drop** — reorder anything with the handle, no external drag libraries
- **Persistent** — your list is saved locally and survives restarts
- **Plain-text Save / Load** — export or import your list as a Markdown-style checklist (`- [x]` / `- [ ]`) through native file dialogs; `⌘S` / `Ctrl+S` saves
- **Dark mode** - switch between light and dark mode via a simple button, state is saved between sessions
- **Zero footprint** — one small window, no accounts, no sync, no bloat

## Getting started

Prerequisites:

- [Node.js](https://nodejs.org)
- [Rust](https://rustup.rs)
- Tauri platform dependencies (see the [prerequisites guide](https://tauri.app/start/prerequisites/))

```sh
npm install
npm run tauri dev
```

## Building a release

`tauri.conf.json` wires `beforeBuildCommand: npm run build`, so the release build always compiles the frontend first. Just run:

```sh
npm run tauri build
```

Installers and binaries land in `src-tauri/target/release/bundle/` (e.g. `bundle/macos/RusTODO.app` and `bundle/dmg/RusTODO_1.0.0_aarch64.dmg`).

> **Gotcha:** the frontend is embedded into the binary at compile time. If you only change JS/HTML/CSS, cargo may consider the Rust crate up to date and reuse the old binary — then the app ships stale UI. Fix with a `touch src-tauri/src/main.rs` (or `cargo clean -p`) before rebuilding if a release build seems to ignore frontend changes.

### Installing from a local build (macOS)

Local builds are ad-hoc signed (no developer account in the repo), which is fine for self-installing, but make sure the replacement in `/Applications` actually takes effect — the reliable way is to remove the old copy first, then copy the new one (or drag `RusTODO.app` onto the existing one in Finder, which prompts to replace):

```sh
rm -rf /Applications/RusTODO.app
cp -R src-tauri/target/release/bundle/macos/RusTODO.app /Applications/
```

Then relaunch from `/Applications` (or `open /Applications/RusTODO.app`).

## File format

Save/Load round-trips a simple checklist, one task per line:

```
- [ ] Write the report
- [x] Water the plants
```

## Project structure

```
├── index.html          # UI markup + styling
├── src/
│   └── main.js         # list state, drag & drop, persistence
└── src-tauri/
    ├── src/main.rs     # Tauri commands: native save/load file dialogs
    └── tauri.conf.json # window & bundle configuration
```

- **Rust + Tauri v2** — window, native file dialogs (via `rfd`), plain-text import/export
- **Vanilla JS** — all list logic, drag & drop, and `localStorage` persistence
- **Vite** — dev server and bundling

## License

[MIT](LICENSE)
