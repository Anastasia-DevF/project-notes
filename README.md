# Project Notes

A small cross-platform desktop app for keeping project notes, terminal commands and useful links. Data is stored locally with the official Tauri Store Plugin.

## Local development

Requirements: Node.js/npm and the platform prerequisites for Tauri v2, including Rust.

```bash
npm install
npm run tauri dev
```

Frontend-only checks:

```bash
npm run dev
npm run build
```

The browser preview cannot access Tauri plugins, so persistent storage and opening external links should be tested through `npm run tauri dev`.

## Production build

```bash
npm run tauri build
```

Saved commands are plain text. The app never executes them.
