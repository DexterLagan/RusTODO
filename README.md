# Rustodo

A tiny, fast todo list that lives on your desktop. Built with **Rust** and [Tauri v2](https://tauri.app) on the backend and plain vanilla JavaScript on the frontend — no framework, no network, no telemetry.

## Features

- **Quick capture** — type in the input, press Enter, done
- **Smart ordering** — checking an item moves it below all open items, with the most recently checked on top so you can see your progress; unchecking sends it back to the bottom of the open list
- **Drag & drop** — reorder anything with the handle, no external drag libraries
- **Persistent** — your list is saved locally and survives restarts
- **Plain-text Save / Load** — export or import your list as a Markdown-style checklist (`- [x]` / `- [ ]`) through native file dialogs; `⌘S` / `Ctrl+S` saves
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

```sh
npm run tauri build
```

Installers and binaries land in `src-tauri/target/release/bundle/`.

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
