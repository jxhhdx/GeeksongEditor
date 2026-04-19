# GeeksongEditor (Rust) Design Spec

## Overview

A real, daily-usable Markdown editor built with **Rust + Tauri v2**. 
Rust owns the core: parsing, AST manipulation, file I/O, config, export. 
The web frontend owns rendering and user interaction only.

## Philosophy
- **Rust is the brain**: Markdown AST, file system, config, export engines live in Rust.
- **Frontend is the face**: Editor surface, preview pane, UI chrome. No business logic in JS.
- **No AI**: No completions, no chat, no "copilot". Just a fast, reliable Markdown editor.

## Goals
- Edit Markdown with live preview (split pane)
- Native file system integration (open folder, save, auto-save)
- Support: headings, paragraphs, lists (bullet, ordered, checkbox), tables
- Optional: Mermaid diagrams, math (KaTeX) — rendered in preview, stored as plain MD
- Export to HTML and PDF
- Cross-platform desktop app (macOS, Windows, Linux)
- Fast cold start (< 500ms), responsive editing

## Non-Goals
- Real-time collaboration
- Cloud sync / accounts
- Plugin system (post-MVP)
- AI features of any kind
- Becoming an IDE

## Architecture

```
┌─────────────────────────────────────────────┐
│  Frontend (WebView)                         │
│  ┌──────────────┐  ┌─────────────────────┐  │
│  │ CodeMirror 6 │  │ Preview (HTML)      │  │
│  │ (Markdown)   │  │                     │  │
│  └──────────────┘  └─────────────────────┘  │
│  Toolbar | StatusBar | FileTree             │
└─────────────────────────────────────────────┘
            ↑↓ Tauri Commands / Events
┌─────────────────────────────────────────────┐
│  Rust Backend                               │
│  • markdown::ast    — AST types & ops       │
│  • markdown::parser — pulldown-cmark wrap   │
│  • markdown::render — HTML output           │
│  • fs::commands     — open/save/watch       │
│  • config::store    — serde + toml          │
│  • export::html     — HTML export           │
│  • export::pdf      — PDF export            │
└─────────────────────────────────────────────┘
```

## Rust Crate Layout (`src-tauri/src/`)

```
main.rs           — Tauri app setup, command registration
markdown/
  mod.rs          — Public API
  ast.rs          — AST node types
  parser.rs       — MD text → AST (pulldown-cmark)
  render.rs       — AST → HTML string
  manip.rs        — AST mutations (insert heading, toggle list, etc.)
fs/
  mod.rs
  commands.rs     — Tauri commands for file ops
  watcher.rs      — File change notifications (notify crate)
config/
  mod.rs
  model.rs        — Config struct (theme, font size, etc.)
  store.rs        — Load/save toml in app dir
export/
  mod.rs
  html.rs         — Export AST → standalone HTML file
  pdf.rs          — Export HTML → PDF
```

## Frontend Layout (`src/`)

```
main.tsx          — React root, Tauri invoke setup
App.tsx           — Theme provider, layout shell
components/
  Editor.tsx      — CodeMirror 6 wrapper
  Preview.tsx     — Rendered HTML preview
  Toolbar.tsx     — Format buttons (call Rust manip commands)
  FileTree.tsx    — File explorer sidebar
  StatusBar.tsx   — Word count, file path, save state
hooks/
  useTauri.ts     — Typed Tauri invoke helpers
  useConfig.ts    — Load/save config via Rust
  useScrollSync.ts— Two-way scroll sync
styles/
  preview.css     — GitHub-like markdown styles (light/dark)
```

## Data Flow

### Editing
1. User types in CodeMirror 6
2. Frontend debounces (300ms) and sends `render_markdown(text)` to Rust
3. Rust parses with `pulldown-cmark`, renders HTML, returns string
4. Frontend injects HTML into Preview pane

### File Open
1. User clicks "Open Folder"
2. Frontend calls `show_directory_picker()` (via Tauri dialog)
3. Rust walks directory, returns list of `.md` files
4. Frontend displays FileTree
5. Click file → Rust reads content → sent to frontend → loaded into editor

### Save
1. User presses Cmd+S or auto-save triggers
2. Frontend sends `save_file(path, content)` to Rust
3. Rust writes to disk
4. Rust emits event → frontend shows "Saved" in StatusBar

### Toolbar Insert
1. User clicks toolbar button (e.g., "Heading")
2. Frontend can either:
   a. Insert text directly into CodeMirror (fast, simple), OR
   b. Call Rust `manip::insert_heading(ast, position)` for complex ops
   → MVP uses (a) for simplicity; complex AST ops are post-MVP.

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop Shell | Tauri v2 |
| Rust Parser | `pulldown-cmark` + `pulldown-cmark-to-cmark` |
| Rust HTML Render | Custom AST walker + `maud` or `askama` (minimal) |
| Rust Config | `serde` + `toml` + `dirs` |
| Rust File Watch | `notify` |
| Rust PDF Export | `headless_chrome` or print-to-PDF via Tauri API |
| Frontend Framework | React 19 + TypeScript |
| Frontend Editor | CodeMirror 6 (`@codemirror/lang-markdown`) |
| Frontend Styling | Tailwind CSS |
| Frontend Build | Vite (bundled by Tauri) |

## Error Handling

| Scenario | Handling |
|---|---|
| Parse error (invalid MD) | `pulldown-cmark` is fault-tolerant; render as plain text |
| File read permission denied | Show error toast; keep editor in previous state |
| File deleted externally | Notify user via event; mark as "deleted" in tab |
| Large file (>5MB) | Disable live preview; require manual refresh |
| Export failure | Return structured error to frontend; show details |

## Testing Strategy

- **Rust unit**: AST manipulations, parser round-trips, config serialization
- **Rust integration**: File commands with temp directories
- **Frontend unit**: Scroll sync math, toolbar text insertion
- **E2E**: Tauri driver (optional, post-MVP)

## Milestones

1. **M0 Scaffold**: Tauri v2 + React + Tailwind running; hello world
2. **M1 Editor + Preview**: CodeMirror 6 + Rust render pipeline; split pane
3. **M2 File Ops**: Open folder/file, save, file tree, recent files
4. **M3 Polish**: Toolbar, scroll sync, dark mode, config persistence
5. **M4 Export**: HTML and PDF export from Rust
6. **M5 Extended Syntax**: Tables, task lists, Mermaid (if time permits)
