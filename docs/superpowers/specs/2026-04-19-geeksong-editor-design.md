# GeeksongEditor Design Spec

## Overview

GeeksongEditor (极客松 Markdown 编辑器) is a browser-based Markdown editor targeting developers and technical writers. It emphasizes a fast, privacy-first editing experience with local file system integration.

## Goals

- Provide a distraction-free Markdown editing experience comparable to desktop editors
- Keep all user data local (no server, no cloud upload)
- Support standard Markdown + GFM (GitHub Flavored Markdown)
- Offer real-time preview with synchronized scrolling

## Non-Goals

- Real-time collaborative editing
- Cloud sync or user accounts
- Plugin/extension system (future consideration)

## Architecture

### Layout: Three-Column Classic Editor

```
+-----------+-------------------+-------------------+
|           |                   |                   |
|  File     |     Editor        |     Preview       |
|  Tree     |   (Monaco)        |   (Rendered)      |
|           |                   |                   |
+-----------+-------------------+-------------------+
| Status Bar (word count, file path, mode)          |
+---------------------------------------------------+
```

### Module Breakdown

| Module | Purpose | Dependencies |
|---|---|---|
| `FileManager` | Left sidebar file tree, folder open, `.md` file discovery | File System Access API |
| `EditorPane` | Monaco Editor instance with Markdown language mode | `@monaco-editor/react` |
| `PreviewPane` | Rendered Markdown output with scroll sync | `marked`, `highlight.js` |
| `Toolbar` | Format shortcuts, export actions, theme toggle | EditorPane (commands) |
| `StatusBar` | Word/char count, current file path, save indicator | EditorPane state |
| `AppShell` | Layout composition, panel resizing, theme provider | All modules |

### Data Flow

```
User typing in Monaco
        |
        v
  React state (markdown text)
        |
        +-- debounced (300ms) --> marked.parse() --> HTML string
        |                                              |
        |                                              v
        |                                       PreviewPane (dangerouslySetInnerHTML)
        |
        +-- onSave --> File System Access API --> Write to disk
```

- A single `AppContext` holds the currently active file path and editor content.
- `EditorPane` updates the context on every change.
- `PreviewPane` subscribes to the context and re-renders after debounce.
- `FileManager` updates the context when a different file is selected.

## Component Design

### FileManager

- **Input**: A `FileSystemDirectoryHandle` from the File System Access API.
- **Behavior**: Recursively lists `.md` files. Clicking a file loads its content into the editor context.
- **State**: Expanded/collapsed folders, active file highlight.

### EditorPane

- **Input**: Initial file content, file path (for language detection).
- **Behavior**: Monaco Editor in controlled mode. Listens for `Ctrl/Cmd+S` to trigger file save.
- **Configuration**: Word wrap enabled, minimap disabled (by default), line numbers on.

### PreviewPane

- **Input**: Markdown string.
- **Behavior**: Parses via `marked` with `highlight.js` for code blocks. DOMPurify sanitizes output.
- **Scroll Sync**: Two-way approximate scroll sync between editor and preview (header-based anchoring, not pixel-perfect).

### Toolbar

- **Actions**:
  - Bold / Italic / Heading / Link / Image / Code / Quote / List / Task List (inserts Markdown syntax at cursor)
  - Export to HTML
  - Export to PDF (via `html2canvas` + `jspdf` or print-to-PDF)
  - Toggle dark/light theme
  - Toggle editor-only / preview-only / split mode

### StatusBar

- **Display**: Word count, character count, current file name/path, last saved timestamp.

## Error Handling

| Scenario | Handling |
|---|---|
| File System Access API unavailable | Gracefully degrade: show "Open File" / "Save As" buttons using traditional `<input type="file">` and `URL.createObjectURL` / `download` anchor |
| Permission denied on save | Show inline error toast; do not crash |
| Markdown parse error | `marked` is fault-tolerant; invalid syntax renders as plain text |
| Unsafe HTML in preview | DOMPurify strips dangerous tags/attributes |
| Very large file (>1MB) | Show warning banner; disable live preview, require manual refresh |

## Styling & Theming

- Two built-in themes: Light (GitHub-like) and Dark (VS Code-like).
- Editor theme follows Monaco's built-in themes (`vs` / `vs-dark`).
- Preview CSS is custom-built to match the selected theme.
- Resizable panels via CSS Grid or a lightweight splitter library.

## Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | React 19 + TypeScript | Standard, good ecosystem |
| Build Tool | Vite | Fast dev server, native ESM, simple config |
| Editor | `@monaco-editor/react` | Full-featured, familiar to developers |
| Markdown Parser | `marked` + `marked-gfm` | Fast, widely used, extensible |
| Syntax Highlighting | `highlight.js` | Works with `marked`, supports many languages |
| Sanitization | `dompurify` | Prevent XSS from user Markdown |
| PDF Export | `html2canvas` + `jspdf` | Client-side only, no server needed |
| Styling | Tailwind CSS | Utility-first, rapid UI development |
| State | React Context | Simple enough for this scope |

## Testing Strategy

- **Unit**: Markdown parse/render pipeline (input string → expected HTML output).
- **Unit**: Utility functions (word count, scroll sync position calculation).
- **Integration**: File open/save flow with mocked File System Access API.
- **E2E** (future): Playwright tests for critical paths (type → preview updates → export).

## File Structure

```
src/
  components/
    AppShell.tsx
    FileManager.tsx
    EditorPane.tsx
    PreviewPane.tsx
    Toolbar.tsx
    StatusBar.tsx
  context/
    AppContext.tsx
  hooks/
    useFileSystem.ts
    useMarkdownParser.ts
    useScrollSync.ts
  utils/
    export.ts
    wordCount.ts
  styles/
    preview-light.css
    preview-dark.css
  App.tsx
  main.tsx
```

## Milestones

1. **MVP**: Editor + Preview split view, basic Markdown rendering, file open/save via File System Access API.
2. **Polish**: Toolbar shortcuts, scroll sync, dark theme, word count.
3. **Export**: HTML export, PDF export.
4. **Enhancements**: Folder tree view, recent files, settings panel.

## Open Questions (Resolved)

- **Desktop vs Web**: Chose Web first; can be wrapped later with Tauri if needed.
- **Scroll sync precision**: Accepted approximate header-based sync as sufficient for MVP.
