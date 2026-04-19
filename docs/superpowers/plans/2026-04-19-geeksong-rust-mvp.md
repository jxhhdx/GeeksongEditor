# GeeksongEditor MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a real, daily-usable Markdown editor with Rust (Tauri v2) backend + React/TypeScript frontend.

**Architecture:** Tauri v2 desktop app. Rust handles all core logic: Markdown parsing/rendering (`pulldown-cmark`), file system operations, config persistence, HTML export. Frontend handles CodeMirror 6 editing surface, preview pane, UI chrome. Communication via Tauri commands.

**Tech Stack:** Tauri v2, Rust 1.70+, React 19, TypeScript, Vite, Tailwind CSS v4, CodeMirror 6.

---

## File Structure

```
src-tauri/
  Cargo.toml
  tauri.conf.json
  capabilities/
    default.json
  src/
    main.rs
    markdown.rs      — Markdown parse → HTML
    fs.rs            — File system commands
    config.rs        — Config load/save
    export.rs        — HTML export
src/
  main.tsx
  App.tsx
  index.css
  components/
    Editor.tsx
    Preview.tsx
    Toolbar.tsx
    FileTree.tsx
    StatusBar.tsx
  hooks/
    useScrollSync.ts
  utils/
    tauri.ts
index.html
package.json
vite.config.ts
tsconfig.json
```

---

### Task 1: Tauri v2 Project Scaffold

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `index.html`
- Create: `src-tauri/Cargo.toml`
- Create: `src-tauri/tauri.conf.json`
- Create: `src-tauri/capabilities/default.json`
- Create: `src-tauri/src/main.rs`
- Create: `src-tauri/.gitignore`
- Create: `.gitignore`

- [ ] **Step 1: Write package.json**

```json
{
  "name": "geeksong-editor",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "tauri": "tauri",
    "test": "vitest run"
  },
  "dependencies": {
    "@codemirror/lang-markdown": "^6.3.2",
    "@codemirror/state": "^6.5.2",
    "@codemirror/view": "^6.36.4",
    "@tauri-apps/api": "^2.5.0",
    "@tauri-apps/plugin-dialog": "^2.2.1",
    "codemirror": "^6.0.1",
    "dompurify": "^3.2.5",
    "highlight.js": "^11.11.1",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.4",
    "@tauri-apps/cli": "^2.5.0",
    "@types/dompurify": "^3.2.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^4.1.4",
    "typescript": "~5.7.0",
    "vite": "^6.0.0",
    "vitest": "^3.0.0",
    "jsdom": "^26.0.0"
  }
}
```

- [ ] **Step 2: Write vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: { ignored: ['**/src-tauri/**'] },
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: 'safari17',
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

- [ ] **Step 3: Write tsconfig.json**

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

- [ ] **Step 4: Write tsconfig.app.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src"]
}
```

- [ ] **Step 5: Write tsconfig.node.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 6: Write index.html**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GeeksongEditor</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Write src-tauri/Cargo.toml**

```toml
[package]
name = "geeksong-editor"
version = "0.1.0"
description = "GeeksongEditor - A real Markdown editor built with Rust"
authors = ["you"]
edition = "2021"

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-dialog = "2"
tauri-plugin-shell = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
pulldown-cmark = { version = "0.12", default-features = false, features = ["html"] }
html-escape = "0.2"
toml = "0.8"
dirs = "6"
once_cell = "1"

[features]
custom-protocol = ["tauri/custom-protocol"]
```

- [ ] **Step 8: Write src-tauri/tauri.conf.json**

```json
{
  "$schema": "../node_modules/@tauri-apps/cli/schema.json",
  "productName": "GeeksongEditor",
  "version": "0.1.0",
  "identifier": "com.geeksong.editor",
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devUrl": "http://localhost:1420",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "title": "GeeksongEditor",
        "width": 1400,
        "height": 900,
        "minWidth": 800,
        "minHeight": 600,
        "resizable": true,
        "fullscreen": false,
        "center": true
      }
    ],
    "security": {
      "csp": "default-src 'self'; img-src 'self' asset: http://asset.localhost; style-src 'self' 'unsafe-inline'"
    }
  },
  "capabilities": [
    {
      "identifier": "default",
      "description": "Default capabilities",
      "local": true,
      "windows": ["main"],
      "permissions": [
        "core:default",
        "dialog:default",
        "shell:default"
      ]
    }
  ],
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
}
```

- [ ] **Step 9: Write src-tauri/capabilities/default.json**

```json
{
  "$schema": "../node_modules/@tauri-apps/cli/schema.json",
  "identifier": "default",
  "description": "Default capabilities for the app",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "dialog:default",
    "shell:default"
  ]
}
```

- [ ] **Step 10: Write src-tauri/src/main.rs**

```rust
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            markdown::render_markdown,
            fs::read_file,
            fs::write_file,
            fs::list_md_files,
            config::load_config,
            config::save_config,
            export::export_html,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

mod markdown;
mod fs;
mod config;
mod export;
```

- [ ] **Step 11: Write .gitignore**

```
node_modules
dist
dist-ssr
*.local
.DS_Store
src-tauri/target
src-tauri/gen
Cargo.lock
```

- [ ] **Step 12: Write src-tauri/.gitignore**

```
/target
/gen
/Cargo.lock
```

- [ ] **Step 13: Install frontend dependencies**

Run: `npm install`
Expected: `node_modules/` created, no errors.

- [ ] **Step 14: Commit**

```bash
git add package.json package-lock.json vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json index.html src-tauri/ .gitignore
git commit -m "chore: scaffold Tauri v2 + React + Tailwind project"
```

---

### Task 2: Rust Markdown Render Module

**Files:**
- Create: `src-tauri/src/markdown.rs`

- [ ] **Step 1: Implement markdown render**

```rust
use pulldown_cmark::{html, Options, Parser};
use serde::Serialize;

#[derive(Serialize)]
pub struct RenderResult {
    pub html: String,
}

#[tauri::command]
pub fn render_markdown(text: String) -> RenderResult {
    let mut options = Options::empty();
    options.insert(Options::ENABLE_TABLES);
    options.insert(Options::ENABLE_FOOTNOTES);
    options.insert(Options::ENABLE_STRIKETHROUGH);
    options.insert(Options::ENABLE_TASKLISTS);
    options.insert(Options::ENABLE_SMART_PUNCTUATION);

    let parser = Parser::new_ext(&text, options);
    let mut html_output = String::new();
    html::push_html(&mut html_output, parser);

    RenderResult { html: html_output }
}
```

- [ ] **Step 2: Commit**

```bash
git add src-tauri/src/markdown.rs
git commit -m "feat(rust): add markdown render command with pulldown-cmark"
```

---

### Task 3: Rust File System Module

**Files:**
- Create: `src-tauri/src/fs.rs`

- [ ] **Step 1: Implement file system commands**

```rust
use serde::Serialize;
use std::fs;
use std::path::Path;

#[derive(Serialize)]
pub struct MdFile {
    pub name: String,
    pub path: String,
}

#[tauri::command]
pub fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn write_file(path: String, content: String) -> Result<(), String> {
    fs::write(&path, content).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_md_files(dir: String) -> Result<Vec<MdFile>, String> {
    let path = Path::new(&dir);
    if !path.is_dir() {
        return Err("Not a directory".to_string());
    }

    let mut files = Vec::new();
    let entries = fs::read_dir(path).map_err(|e| e.to_string())?;

    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let name = entry.file_name().to_string_lossy().to_string();
        if name.ends_with(".md") || name.ends_with(".markdown") {
            let full_path = entry.path().to_string_lossy().to_string();
            files.push(MdFile { name, path: full_path });
        }
    }

    files.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(files)
}
```

- [ ] **Step 2: Commit**

```bash
git add src-tauri/src/fs.rs
git commit -m "feat(rust): add file system commands (read, write, list md)"
```

---

### Task 4: Rust Config Module

**Files:**
- Create: `src-tauri/src/config.rs`

- [ ] **Step 1: Implement config load/save**

```rust
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct EditorConfig {
    #[serde(default)]
    pub theme: String,
    #[serde(default = "default_font_size")]
    pub font_size: u32,
    #[serde(default = "default_true")]
    pub word_wrap: bool,
    #[serde(default)]
    pub recent_folders: Vec<String>,
}

fn default_font_size() -> u32 { 14 }
fn default_true() -> bool { true }

impl Default for EditorConfig {
    fn default() -> Self {
        Self {
            theme: "light".to_string(),
            font_size: 14,
            word_wrap: true,
            recent_folders: Vec::new(),
        }
    }
}

fn config_path() -> Result<PathBuf, String> {
    let dir = dirs::config_dir()
        .ok_or("Cannot find config dir")?
        .join("geeksong-editor");
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir.join("config.toml"))
}

#[tauri::command]
pub fn load_config() -> Result<EditorConfig, String> {
    let path = config_path()?;
    if !path.exists() {
        return Ok(EditorConfig::default());
    }
    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let config: EditorConfig = toml::from_str(&content).map_err(|e| e.to_string())?;
    Ok(config)
}

#[tauri::command]
pub fn save_config(config: EditorConfig) -> Result<(), String> {
    let path = config_path()?;
    let content = toml::to_string_pretty(&config).map_err(|e| e.to_string())?;
    fs::write(&path, content).map_err(|e| e.to_string())
}
```

- [ ] **Step 2: Commit**

```bash
git add src-tauri/src/config.rs
git commit -m "feat(rust): add config persistence with toml"
```

---

### Task 5: Rust HTML Export Module

**Files:**
- Create: `src-tauri/src/export.rs`

- [ ] **Step 1: Implement HTML export**

```rust
use crate::markdown::render_markdown;

#[tauri::command]
pub fn export_html(path: String, content: String) -> Result<(), String> {
    let rendered = render_markdown(content);
    let html = format!(
        r#"<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{}</title>
<style>
body {{ max-width: 900px; margin: 2em auto; padding: 0 1em; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #24292f; }}
h1, h2, h3, h4, h5, h6 {{ margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 600; }}
h1 {{ font-size: 2em; border-bottom: 1px solid #d0d7de; padding-bottom: 0.3em; }}
h2 {{ font-size: 1.5em; border-bottom: 1px solid #d0d7de; padding-bottom: 0.3em; }}
p {{ margin-bottom: 1em; }}
pre {{ background: #f6f8fa; padding: 1em; border-radius: 6px; overflow-x: auto; }}
code {{ font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.875em; background: #f6f8fa; padding: 0.2em 0.4em; border-radius: 3px; }}
pre code {{ background: transparent; padding: 0; }}
blockquote {{ border-left: 4px solid #d0d7de; padding-left: 1em; color: #57606a; margin: 0 0 1em 0; }}
ul, ol {{ padding-left: 1.5em; margin-bottom: 1em; }}
li + li {{ margin-top: 0.25em; }}
img {{ max-width: 100%; }}
table {{ border-collapse: collapse; width: 100%; margin-bottom: 1em; }}
th, td {{ border: 1px solid #d0d7de; padding: 6px 12px; }}
th {{ background: #f6f8fa; font-weight: 600; }}
input[type="checkbox"] {{ margin-right: 0.5em; }}
</style>
</head>
<body>
{}
</body>
</html>"#,
        html_escape::encode_text(&std::path::Path::new(&path)
            .file_stem()
            .unwrap_or_default()
            .to_string_lossy()),
        rendered.html
    );
    std::fs::write(&path, html).map_err(|e| e.to_string())
}
```

- [ ] **Step 2: Commit**

```bash
git add src-tauri/src/export.rs
git commit -m "feat(rust): add HTML export command"
```

---

### Task 6: Verify Rust Backend Compiles

**Files:**
- Modify: `src-tauri/src/main.rs`

- [ ] **Step 1: Update main.rs to register all modules**

Ensure `src-tauri/src/main.rs` matches Task 1 Step 10 exactly.

- [ ] **Step 2: Add tauri-build build.rs**

Create `src-tauri/build.rs`:

```rust
fn main() {
    tauri_build::build()
}
```

- [ ] **Step 3: Compile Rust**

Run: `cd src-tauri && cargo check`
Expected: Clean compile, no errors.

If errors occur (e.g., macro `generate_context!` requires tauri.conf.json in specific location), fix paths in `tauri.conf.json`.

- [ ] **Step 4: Commit**

```bash
git add src-tauri/build.rs
git commit -m "chore(rust): verify backend compiles"
```

---

### Task 7: Frontend Entry + Styles

**Files:**
- Create: `src/main.tsx`
- Create: `src/index.css`
- Create: `src/utils/tauri.ts`

- [ ] **Step 1: Write src/utils/tauri.ts**

```typescript
import { invoke } from '@tauri-apps/api/core'

export interface RenderResult {
  html: string
}

export interface MdFile {
  name: string
  path: string
}

export interface EditorConfig {
  theme: string
  font_size: number
  word_wrap: boolean
  recent_folders: string[]
}

export function renderMarkdown(text: string): Promise<RenderResult> {
  return invoke('render_markdown', { text })
}

export function readFile(path: string): Promise<string> {
  return invoke('read_file', { path })
}

export function writeFile(path: string, content: string): Promise<void> {
  return invoke('write_file', { path, content })
}

export function listMdFiles(dir: string): Promise<MdFile[]> {
  return invoke('list_md_files', { dir })
}

export function loadConfig(): Promise<EditorConfig> {
  return invoke('load_config')
}

export function saveConfig(config: EditorConfig): Promise<void> {
  return invoke('save_config', { config })
}

export function exportHtml(path: string, content: string): Promise<void> {
  return invoke('export_html', { path, content })
}

- [ ] **Step 2: Write src/main.tsx**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 3: Write src/index.css**

```css
@import "tailwindcss";

@theme {
  --color-bg: #ffffff;
  --color-bg-dark: #0d1117;
  --color-surface: #f6f8fa;
  --color-surface-dark: #161b22;
  --color-border: #d0d7de;
  --color-border-dark: #30363d;
  --color-text: #24292f;
  --color-text-dark: #c9d1d9;
  --color-text-muted: #57606a;
  --color-text-muted-dark: #8b949e;
  --color-primary: #0969da;
  --color-primary-dark: #58a6ff;
}

html, body, #root {
  height: 100%;
  margin: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', Roboto, sans-serif;
}

.cm-editor {
  height: 100%;
}

.cm-scroller {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace !important;
  font-size: 14px;
  line-height: 1.6;
}

.preview-content {
  line-height: 1.6;
  color: var(--color-text);
}

.preview-content h1, .preview-content h2, .preview-content h3,
.preview-content h4, .preview-content h5, .preview-content h6 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
  line-height: 1.25;
}

.preview-content h1 { font-size: 2em; border-bottom: 1px solid var(--color-border); padding-bottom: 0.3em; }
.preview-content h2 { font-size: 1.5em; border-bottom: 1px solid var(--color-border); padding-bottom: 0.3em; }
.preview-content p { margin-bottom: 1em; }

.preview-content pre {
  background: var(--color-surface);
  padding: 1em;
  border-radius: 6px;
  overflow-x: auto;
  margin-bottom: 1em;
}

.preview-content code {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 0.875em;
  background: var(--color-surface);
  padding: 0.2em 0.4em;
  border-radius: 3px;
}

.preview-content pre code {
  background: transparent;
  padding: 0;
}

.preview-content blockquote {
  border-left: 4px solid var(--color-border);
  padding-left: 1em;
  color: var(--color-text-muted);
  margin: 0 0 1em 0;
}

.preview-content ul, .preview-content ol {
  padding-left: 1.5em;
  margin-bottom: 1em;
}

.preview-content li + li { margin-top: 0.25em; }

.preview-content img { max-width: 100%; }

.preview-content table {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 1em;
}

.preview-content th, .preview-content td {
  border: 1px solid var(--color-border);
  padding: 6px 12px;
}

.preview-content th { background: var(--color-surface); font-weight: 600; }

.preview-content input[type="checkbox"] { margin-right: 0.5em; }

.dark .preview-content { color: var(--color-text-dark); }
.dark .preview-content h1, .dark .preview-content h2 { border-bottom-color: var(--color-border-dark); }
.dark .preview-content pre { background: var(--color-surface-dark); }
.dark .preview-content code { background: var(--color-surface-dark); }
.dark .preview-content blockquote { border-left-color: var(--color-border-dark); color: var(--color-text-muted-dark); }
.dark .preview-content th, .dark .preview-content td { border-color: var(--color-border-dark); }
.dark .preview-content th { background: var(--color-surface-dark); }
```

- [ ] **Step 4: Commit**

```bash
git add src/main.tsx src/index.css src/utils/tauri.ts
git commit -m "feat(frontend): add entry, styles, and tauri typed helpers"
```

---

### Task 8: Editor Component (CodeMirror 6)

**Files:**
- Create: `src/components/Editor.tsx`

- [ ] **Step 1: Install CodeMirror dependencies**

Run: `npm install codemirror @codemirror/lang-markdown @codemirror/view @codemirror/state @codemirror/commands`
Expected: packages installed.

- [ ] **Step 2: Write Editor.tsx**

```tsx
import { useEffect, useRef } from 'react'
import { EditorView, keymap } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { markdown } from '@codemirror/lang-markdown'
import { indentWithTab } from '@codemirror/commands'

interface EditorProps {
  content: string
  onChange: (value: string) => void
  onSave?: () => void
  theme?: 'light' | 'dark'
}

export default function Editor({ content, onChange, onSave, theme = 'light' }: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)

  useEffect(() => {
    if (!editorRef.current) return

    const extensions = [
      markdown(),
      keymap.of([indentWithTab]),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChange(update.state.doc.toString())
        }
      }),
      EditorView.theme({
        '&': { height: '100%' },
        '.cm-scroller': { overflow: 'auto' },
        '.cm-gutters': {
          backgroundColor: theme === 'dark' ? '#0d1117' : '#f6f8fa',
          color: theme === 'dark' ? '#8b949e' : '#57606a',
          borderRight: `1px solid ${theme === 'dark' ? '#30363d' : '#d0d7de'}`,
        },
        '.cm-activeLineGutter': {
          backgroundColor: theme === 'dark' ? '#161b22' : '#e6eaef',
        },
        '.cm-activeLine': {
          backgroundColor: theme === 'dark' ? '#161b22' : '#e6eaef',
        },
      }),
      EditorView.darkTheme.of(theme === 'dark'),
    ]

    const state = EditorState.create({
      doc: content,
      extensions,
    })

    const view = new EditorView({
      state,
      parent: editorRef.current,
    })

    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [theme])

  // Sync external content changes (e.g., file switch)
  useEffect(() => {
    const view = viewRef.current
    if (!view || view.state.doc.toString() === content) return
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: content },
    })
  }, [content])

  return <div ref={editorRef} className="h-full w-full" />
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Editor.tsx
git commit -m "feat(frontend): add CodeMirror 6 editor component"
```

---

### Task 9: Preview Component

**Files:**
- Create: `src/components/Preview.tsx`

- [ ] **Step 1: Write Preview.tsx**

```tsx
import { forwardRef } from 'react'
import DOMPurify from 'dompurify'

interface PreviewProps {
  html: string
}

const Preview = forwardRef<HTMLDivElement, PreviewProps>(({ html }, ref) => {
  const clean = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })

  return (
    <div
      ref={ref}
      className="h-full w-full overflow-auto px-6 py-4 preview-content"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  )
})

Preview.displayName = 'Preview'
export default Preview
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Preview.tsx
git commit -m "feat(frontend): add preview component with DOMPurify"
```

---

### Task 10: Toolbar Component

**Files:**
- Create: `src/components/Toolbar.tsx`

- [ ] **Step 1: Write Toolbar.tsx**

```tsx
interface ToolbarProps {
  onToggleSidebar: () => void
  sidebarOpen: boolean
  onToggleTheme: () => void
  isDark: boolean
  onExportHtml: () => void
  onInsert: (syntax: string) => void
}

export default function Toolbar({
  onToggleSidebar,
  sidebarOpen,
  onToggleTheme,
  isDark,
  onExportHtml,
  onInsert,
}: ToolbarProps) {
  return (
    <div className="h-11 border-b border-[var(--color-border)] dark:border-[var(--color-border-dark)] flex items-center px-3 gap-1.5 bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] flex-shrink-0 select-none">
      <button
        onClick={onToggleSidebar}
        className={`px-2 py-1 rounded text-sm transition-colors ${
          sidebarOpen
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
            : 'hover:bg-black/5 dark:hover:bg-white/5'
        }`}
        title="文件树"
      >
        ☰
      </button>

      <div className="w-px h-5 bg-[var(--color-border)] dark:bg-[var(--color-border-dark)] mx-1" />

      <button onClick={() => onInsert('**粗体**')} className="px-2 py-1 rounded text-sm font-bold hover:bg-black/5 dark:hover:bg-white/5" title="粗体">B</button>
      <button onClick={() => onInsert('*斜体*')} className="px-2 py-1 rounded text-sm italic hover:bg-black/5 dark:hover:bg-white/5" title="斜体">I</button>
      <button onClick={() => onInsert('## 标题')} className="px-2 py-1 rounded text-sm hover:bg-black/5 dark:hover:bg-white/5" title="标题">H</button>
      <button onClick={() => onInsert('```\n代码\n```')} className="px-2 py-1 rounded text-sm hover:bg-black/5 dark:hover:bg-white/5" title="代码块">{`{ }`}</button>
      <button onClick={() => onInsert('> 引用')} className="px-2 py-1 rounded text-sm hover:bg-black/5 dark:hover:bg-white/5" title="引用">"</button>
      <button onClick={() => onInsert('- 列表项')} className="px-2 py-1 rounded text-sm hover:bg-black/5 dark:hover:bg-white/5" title="无序列表">•</button>
      <button onClick={() => onInsert('1. 列表项')} className="px-2 py-1 rounded text-sm hover:bg-black/5 dark:hover:bg-white/5" title="有序列表">1.</button>
      <button onClick={() => onInsert('- [ ] 任务')} className="px-2 py-1 rounded text-sm hover:bg-black/5 dark:hover:bg-white/5" title="任务列表">☐</button>
      <button onClick={() => onInsert('| 列1 | 列2 |\n| --- | --- |\n| 内容 | 内容 |')} className="px-2 py-1 rounded text-sm hover:bg-black/5 dark:hover:bg-white/5" title="表格">⊞</button>

      <div className="flex-1" />

      <button
        onClick={onExportHtml}
        className="px-3 py-1 rounded text-sm bg-purple-600 text-white hover:bg-purple-700 transition-colors"
        title="导出 HTML"
      >
        导出 HTML
      </button>

      <button
        onClick={onToggleTheme}
        className="px-2 py-1 rounded text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        title="切换主题"
      >
        {isDark ? '☀️' : '🌙'}
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Toolbar.tsx
git commit -m "feat(frontend): add toolbar with format buttons and export"
```

---

### Task 11: FileTree Component

**Files:**
- Create: `src/components/FileTree.tsx`

- [ ] **Step 1: Write FileTree.tsx**

```tsx
import { open } from '@tauri-apps/plugin-dialog'
import type { MdFile } from '../utils/tauri'
import { listMdFiles } from '../utils/tauri'

interface FileTreeProps {
  files: MdFile[]
  currentPath: string | null
  onSelect: (file: MdFile) => void
  onFilesLoaded: (files: MdFile[]) => void
}

export default function FileTree({ files, currentPath, onSelect, onFilesLoaded }: FileTreeProps) {
  const openFolder = async () => {
    const selected = await open({ directory: true })
    if (selected && typeof selected === 'string') {
      const mdFiles = await listMdFiles(selected)
      onFilesLoaded(mdFiles)
    }
  }

  return (
    <div className="h-full flex flex-col p-3 gap-2 bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)]">
      <button
        onClick={openFolder}
        className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
      >
        打开文件夹
      </button>

      <div className="flex-1 overflow-auto mt-1">
        {files.length === 0 && (
          <p className="text-xs text-[var(--color-text-muted)] dark:text-[var(--color-text-muted-dark)]">
            点击上方按钮打开 Markdown 文件夹
          </p>
        )}
        <ul className="space-y-0.5">
          {files.map((file) => (
            <li
              key={file.path}
              onClick={() => onSelect(file)}
              className={`cursor-pointer text-sm px-2 py-1 rounded truncate ${
                currentPath === file.path
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              title={file.path}
            >
              {file.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/FileTree.tsx
git commit -m "feat(frontend): add file tree with folder open via Tauri dialog"
```

---

### Task 12: StatusBar Component

**Files:**
- Create: `src/components/StatusBar.tsx`

- [ ] **Step 1: Write StatusBar.tsx**

```tsx
interface StatusBarProps {
  fileName: string
  words: number
  chars: number
  saved: boolean
}

export default function StatusBar({ fileName, words, chars, saved }: StatusBarProps) {
  return (
    <div className="h-7 border-t border-[var(--color-border)] dark:border-[var(--color-border-dark)] flex items-center px-3 text-xs bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] text-[var(--color-text-muted)] dark:text-[var(--color-text-muted-dark)] flex-shrink-0 gap-4">
      <span className="truncate max-w-[300px]">{fileName || '未打开文件'}</span>
      <span className="ml-auto">{words} 词</span>
      <span>{chars} 字符</span>
      <span>{saved ? '已保存' : '未保存'}</span>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/StatusBar.tsx
git commit -m "feat(frontend): add status bar"
```

---

### Task 13: App Layout + Scroll Sync + State Management

**Files:**
- Create: `src/App.tsx`
- Create: `src/hooks/useScrollSync.ts`

- [ ] **Step 1: Write useScrollSync.ts**

```typescript
import { useEffect, RefObject } from 'react'

export function useScrollSync(
  editorRef: RefObject<HTMLDivElement | null>,
  previewRef: RefObject<HTMLDivElement | null>
) {
  useEffect(() => {
    const editorScroller = editorRef.current?.querySelector('.cm-scroller') as HTMLDivElement | null
    const previewEl = previewRef.current
    if (!editorScroller || !previewEl) return

    let isEditorScrolling = false
    let isPreviewScrolling = false
    let editorTimeout: ReturnType<typeof setTimeout>
    let previewTimeout: ReturnType<typeof setTimeout>

    const onEditorScroll = () => {
      if (isPreviewScrolling) return
      isEditorScrolling = true
      clearTimeout(editorTimeout)
      const scrollable = editorScroller.scrollHeight - editorScroller.clientHeight
      const ratio = scrollable > 0 ? editorScroller.scrollTop / scrollable : 0
      const previewScrollable = previewEl.scrollHeight - previewEl.clientHeight
      previewEl.scrollTop = ratio * previewScrollable
      editorTimeout = setTimeout(() => { isEditorScrolling = false }, 80)
    }

    const onPreviewScroll = () => {
      if (isEditorScrolling) return
      isPreviewScrolling = true
      clearTimeout(previewTimeout)
      const scrollable = previewEl.scrollHeight - previewEl.clientHeight
      const ratio = scrollable > 0 ? previewEl.scrollTop / scrollable : 0
      const editorScrollable = editorScroller.scrollHeight - editorScroller.clientHeight
      editorScroller.scrollTop = ratio * editorScrollable
      previewTimeout = setTimeout(() => { isPreviewScrolling = false }, 80)
    }

    editorScroller.addEventListener('scroll', onEditorScroll)
    previewEl.addEventListener('scroll', onPreviewScroll)

    return () => {
      editorScroller.removeEventListener('scroll', onEditorScroll)
      previewEl.removeEventListener('scroll', onPreviewScroll)
    }
  }, [editorRef, previewRef])
}
```

- [ ] **Step 2: Write App.tsx**

```tsx
import { useState, useEffect, useRef, useCallback } from 'react'
import Editor from './components/Editor'
import Preview from './components/Preview'
import Toolbar from './components/Toolbar'
import FileTree from './components/FileTree'
import StatusBar from './components/StatusBar'
import { useScrollSync } from './hooks/useScrollSync'
import { renderMarkdown, readFile, writeFile, exportHtml } from './utils/tauri'
import type { MdFile } from './utils/tauri'
import { save } from '@tauri-apps/plugin-dialog'

function countWords(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

function countChars(text: string): number {
  return text.replace(/\s/g, '').length
}

export default function App() {
  const [content, setContent] = useState('# Hello GeeksongEditor\n\n开始写作吧。')
  const [previewHtml, setPreviewHtml] = useState('')
  const [files, setFiles] = useState<MdFile[]>([])
  const [currentFile, setCurrentFile] = useState<MdFile | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isDark, setIsDark] = useState(false)
  const [saved, setSaved] = useState(true)

  const editorContainerRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  useScrollSync(editorContainerRef, previewRef)

  // Render markdown via Rust
  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(async () => {
      const result = await renderMarkdown(content)
      if (!cancelled) setPreviewHtml(result.html)
    }, 200)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [content])

  // Initial render
  useEffect(() => {
    renderMarkdown(content).then((r) => setPreviewHtml(r.html))
  }, [])

  // Theme persistence
  useEffect(() => {
    const stored = localStorage.getItem('geeksong-theme')
    if (stored === 'dark') setIsDark(true)
  }, [])

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('geeksong-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('geeksong-theme', 'light')
    }
  }, [isDark])

  const handleChange = useCallback((value: string) => {
    setContent(value)
    setSaved(false)
  }, [])

  const handleSelectFile = useCallback(async (file: MdFile) => {
    const text = await readFile(file.path)
    setContent(text)
    setCurrentFile(file)
    setSaved(true)
  }, [])

  const handleSave = useCallback(async () => {
    if (currentFile) {
      await writeFile(currentFile.path, content)
      setSaved(true)
    }
  }, [currentFile, content])

  const handleExport = useCallback(async () => {
    const path = await save({
      filters: [{ name: 'HTML', extensions: ['html'] }],
      defaultPath: currentFile?.name.replace(/\.md$/, '.html') ?? 'export.html',
    })
    if (path) {
      await exportHtml(path, content)
    }
  }, [currentFile, content])

  const handleInsert = useCallback((syntax: string) => {
    setContent((prev) => prev + '\n\n' + syntax + '\n')
    setSaved(false)
  }, [])

  // Keyboard shortcut: Cmd+S
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleSave])

  return (
    <div className="flex flex-col h-screen bg-[var(--color-bg)] dark:bg-[var(--color-bg-dark)] text-[var(--color-text)] dark:text-[var(--color-text-dark)]">
      <Toolbar
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        sidebarOpen={sidebarOpen}
        onToggleTheme={() => setIsDark((v) => !v)}
        isDark={isDark}
        onExportHtml={handleExport}
        onInsert={handleInsert}
      />

      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <div className="w-64 border-r border-[var(--color-border)] dark:border-[var(--color-border-dark)] flex-shrink-0 overflow-auto">
            <FileTree
              files={files}
              currentPath={currentFile?.path ?? null}
              onSelect={handleSelectFile}
              onFilesLoaded={setFiles}
            />
          </div>
        )}

        <div className="flex-1 flex overflow-hidden">
          <div ref={editorContainerRef} className="flex-1 border-r border-[var(--color-border)] dark:border-[var(--color-border-dark)] min-w-0">
            <Editor content={content} onChange={handleChange} theme={isDark ? 'dark' : 'light'} />
          </div>
          <div className="flex-1 min-w-0 bg-[var(--color-bg)] dark:bg-[var(--color-bg-dark)]">
            <Preview html={previewHtml} ref={previewRef} />
          </div>
        </div>
      </div>

      <StatusBar
        fileName={currentFile?.name ?? '未命名'}
        words={countWords(content)}
        chars={countChars(content)}
        saved={saved}
      />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx src/hooks/useScrollSync.ts
git commit -m "feat(frontend): add App layout, scroll sync, state management"
```

---

### Task 14: Build Verification

- [ ] **Step 1: Verify frontend builds**

Run: `npm run build`
Expected: `dist/` created with `index.html`, JS, CSS. No TypeScript errors.

- [ ] **Step 2: Verify Rust builds**

Run: `cd src-tauri && cargo build`
Expected: Binary compiles successfully.

If `tauri::generate_context!()` fails due to missing icons, add placeholder icon files or update `tauri.conf.json` to remove icon references temporarily.

Quick fix for icons: create empty PNG files:
```bash
mkdir -p src-tauri/icons
touch src-tauri/icons/32x32.png src-tauri/icons/128x128.png src-tauri/icons/128x128@2x.png
touch src-tauri/icons/icon.icns src-tauri/icons/icon.ico
```

- [ ] **Step 3: Run Tauri dev**

Run: `npm run tauri dev`
Expected: App window opens with split editor/preview, toolbar, sidebar, status bar.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: GeeksongEditor MVP complete"
```

---

## Spec Self-Review

**1. Spec coverage:**
- ✅ Split view editing — Task 13 (App.tsx)
- ✅ Live preview via Rust — Task 2 + Task 13
- ✅ File open/save — Task 3 (fs.rs) + Task 11 (FileTree) + Task 13 (App)
- ✅ Toolbar shortcuts — Task 10 (Toolbar)
- ✅ Scroll sync — Task 13 (useScrollSync)
- ✅ Dark mode — Task 13 (App.tsx theme toggle)
- ✅ HTML export — Task 5 (export.rs) + Task 10 + Task 13
- ✅ Word count — Task 12 (StatusBar) + Task 13 (countWords)
- ✅ Tables + task lists — Task 2 (pulldown-cmark options)
- ✅ Config persistence — Task 4 (config.rs)

**2. Placeholder scan:**
- No TBD, TODO, or vague instructions.
- Every step has exact file paths and complete code.

**3. Type consistency:**
- `MdFile`, `EditorConfig`, `RenderResult` types used consistently across Rust and TS.
- Command names match between `main.rs` `invoke_handler` and `tauri.ts` invoke calls.

No gaps found. Ready for execution.
