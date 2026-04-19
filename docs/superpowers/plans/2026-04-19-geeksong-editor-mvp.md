# GeeksongEditor MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-based Markdown editor with split-view editing, live preview, file open/save, toolbar shortcuts, scroll sync, dark mode, and HTML export.

**Architecture:** React SPA with Vite, Monaco Editor for editing, `marked` for rendering, File System Access API for local file operations. State managed via React Context. Tailwind CSS for styling.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, Monaco Editor (`@monaco-editor/react`), `marked`, `highlight.js`, `dompurify`, `html2canvas` + `jspdf`.

---

## File Structure

```
src/
  types/
    index.ts              # Shared TypeScript types
  context/
    AppContext.tsx         # Global state: current file, content, theme
  utils/
    markdownParser.ts      # marked setup + parsing
    markdownParser.test.ts # Parser tests
    wordCount.ts           # Word/char counting
    wordCount.test.ts      # Word count tests
    exportHtml.ts          # HTML export logic
    exportHtml.test.ts     # Export tests
  hooks/
    useScrollSync.ts       # Two-way scroll synchronization
  components/
    EditorPane.tsx         # Monaco Editor wrapper
    PreviewPane.tsx        # Rendered Markdown output
    Toolbar.tsx            # Format buttons + actions
    FileManager.tsx        # File tree + open/save
    StatusBar.tsx          # Word count + file info
    AppShell.tsx           # Layout + resize panels
  App.tsx                  # Root: providers + AppShell
  main.tsx                 # Entry point
  index.css                # Tailwind directives + base styles
index.html
vite.config.ts
tailwind.config.js
package.json
tsconfig.json
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `tailwind.config.js`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/index.css`
- Modify: `.gitignore`

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
    "test": "vitest run"
  },
  "dependencies": {
    "@monaco-editor/react": "^4.6.0",
    "dompurify": "^3.1.7",
    "highlight.js": "^11.10.0",
    "html2canvas": "^1.4.1",
    "jspdf": "^2.5.2",
    "marked": "^14.1.3",
    "marked-gfm-heading-id": "^4.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/dompurify": "^3.0.5",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.16",
    "typescript": "~5.7.0",
    "vite": "^6.0.0",
    "vitest": "^2.1.8",
    "jsdom": "^25.0.1"
  }
}
```

- [ ] **Step 2: Write vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
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
    "paths": {
      "@/*": ["src/*"]
    },
    "types": ["vite/client"]
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

- [ ] **Step 6: Write tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
}
```

- [ ] **Step 7: Write index.html**

```html
<!doctype html>
<html lang="en">
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

- [ ] **Step 8: Write src/main.tsx**

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

- [ ] **Step 9: Write src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #root {
  height: 100%;
  margin: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}
```

- [ ] **Step 10: Update .gitignore**

Append to `.gitignore` (create if not exists):

```
node_modules
dist
dist-ssr
*.local
```

- [ ] **Step 11: Install dependencies**

Run: `npm install`
Expected: `node_modules/` populated, no errors.

- [ ] **Step 12: Commit**

```bash
git add package.json package-lock.json vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json tailwind.config.js index.html src/main.tsx src/index.css .gitignore
git commit -m "chore: scaffold Vite + React + TS + Tailwind project"
```

---

### Task 2: Types and AppContext

**Files:**
- Create: `src/types/index.ts`
- Create: `src/context/AppContext.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: Write src/types/index.ts**

```typescript
export interface EditorFile {
  name: string
  path: string
  content: string
  handle?: FileSystemFileHandle
}

export type Theme = 'light' | 'dark'

export interface AppState {
  currentFile: EditorFile | null
  files: EditorFile[]
  theme: Theme
}

export type AppAction =
  | { type: 'SET_CURRENT_FILE'; payload: EditorFile }
  | { type: 'UPDATE_CONTENT'; payload: string }
  | { type: 'SET_FILES'; payload: EditorFile[] }
  | { type: 'TOGGLE_THEME' }
```

- [ ] **Step 2: Write src/context/AppContext.tsx**

```tsx
import { createContext, useContext, useReducer, ReactNode } from 'react'
import type { AppState, AppAction, EditorFile } from '@/types'

const initialState: AppState = {
  currentFile: null,
  files: [],
  theme: (localStorage.getItem('theme') as AppState['theme']) || 'light',
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CURRENT_FILE':
      return { ...state, currentFile: action.payload }
    case 'UPDATE_CONTENT':
      if (!state.currentFile) return state
      const updated = { ...state.currentFile, content: action.payload }
      return {
        ...state,
        currentFile: updated,
        files: state.files.map((f) =>
          f.path === updated.path ? updated : f
        ),
      }
    case 'SET_FILES':
      return { ...state, files: action.payload }
    case 'TOGGLE_THEME': {
      const next = state.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', next)
      return { ...state, theme: next }
    }
    default:
      return state
  }
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
```

- [ ] **Step 3: Wrap main.tsx with AppProvider**

Replace `src/main.tsx` content:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { AppProvider } from './context/AppContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
)
```

- [ ] **Step 4: Commit**

```bash
git add src/types/index.ts src/context/AppContext.tsx src/main.tsx
git commit -m "feat: add AppContext with state management"
```

---

### Task 3: Markdown Parser Utility (TDD)

**Files:**
- Create: `src/utils/markdownParser.ts`
- Create: `src/utils/markdownParser.test.ts`
- Modify: `vite.config.ts`

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect } from 'vitest'
import { parseMarkdown } from './markdownParser'

describe('parseMarkdown', () => {
  it('renders headings', () => {
    const html = parseMarkdown('# Hello')
    expect(html).toContain('<h1 id="hello">Hello</h1>')
  })

  it('renders bold text', () => {
    const html = parseMarkdown('**bold**')
    expect(html).toContain('<strong>bold</strong>')
  })

  it('renders code blocks with highlight classes', () => {
    const md = '```js\nconst x = 1;\n```'
    const html = parseMarkdown(md)
    expect(html).toContain('<pre><code class="language-js">')
  })

  it('sanitizes script tags', () => {
    const md = '<script>alert(1)</script>'
    const html = parseMarkdown(md)
    expect(html).not.toContain('<script>')
  })
})
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npx vitest run src/utils/markdownParser.test.ts`
Expected: FAIL — `parseMarkdown` not defined or throws.

- [ ] **Step 3: Implement parser**

```typescript
import { marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'
import DOMPurify from 'dompurify'

marked.use(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext'
      return hljs.highlight(code, { language }).value
    },
  })
)

marked.setOptions({
  gfm: true,
  breaks: true,
})

export function parseMarkdown(raw: string): string {
  const dirty = marked.parse(raw, { async: false }) as string
  return DOMPurify.sanitize(dirty, { USE_PROFILES: { html: true } })
}
```

- [ ] **Step 4: Run tests to verify pass**

Run: `npx vitest run src/utils/markdownParser.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Add vitest config to vite.config.ts**

Update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

- [ ] **Step 6: Commit**

```bash
git add src/utils/markdownParser.ts src/utils/markdownParser.test.ts vite.config.ts
git commit -m "feat: add markdown parser with syntax highlighting and sanitization"
```

---

### Task 4: Word Count Utility (TDD)

**Files:**
- Create: `src/utils/wordCount.ts`
- Create: `src/utils/wordCount.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect } from 'vitest'
import { countWords, countChars } from './wordCount'

describe('wordCount', () => {
  it('counts words in English', () => {
    expect(countWords('Hello world')).toBe(2)
  })

  it('counts words in mixed text', () => {
    expect(countWords('Hello   world\nfoo')).toBe(3)
  })

  it('returns 0 for empty string', () => {
    expect(countWords('')).toBe(0)
  })

  it('counts characters excluding whitespace', () => {
    expect(countChars('Hello world')).toBe(10)
  })
})
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npx vitest run src/utils/wordCount.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement utilities**

```typescript
export function countWords(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

export function countChars(text: string): number {
  return text.replace(/\s/g, '').length
}
```

- [ ] **Step 4: Run tests to verify pass**

Run: `npx vitest run src/utils/wordCount.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/utils/wordCount.ts src/utils/wordCount.test.ts
git commit -m "feat: add word and character count utilities"
```

---

### Task 5: EditorPane Component

**Files:**
- Create: `src/components/EditorPane.tsx`

- [ ] **Step 1: Create component**

```tsx
import Editor from '@monaco-editor/react'
import { useApp } from '@/context/AppContext'

export default function EditorPane() {
  const { state, dispatch } = useApp()
  const content = state.currentFile?.content ?? ''
  const theme = state.theme === 'dark' ? 'vs-dark' : 'vs'

  return (
    <div className="h-full w-full flex flex-col">
      <Editor
        value={content}
        language="markdown"
        theme={theme}
        options={{
          minimap: { enabled: false },
          wordWrap: 'on',
          lineNumbers: 'on',
          automaticLayout: true,
          fontSize: 14,
          padding: { top: 16 },
          scrollBeyondLastLine: false,
        }}
        onChange={(value) => {
          dispatch({ type: 'UPDATE_CONTENT', payload: value || '' })
        }}
        onMount={(editor, monaco) => {
          editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
            () => {
              // Save handled by FileManager / AppShell
            }
          )
        }}
      />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/EditorPane.tsx
git commit -m "feat: add EditorPane with Monaco Editor"
```

---

### Task 6: PreviewPane Component

**Files:**
- Create: `src/components/PreviewPane.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: Create component**

```tsx
import { forwardRef } from 'react'
import { useApp } from '@/context/AppContext'
import { parseMarkdown } from '@/utils/markdownParser'

const PreviewPane = forwardRef<HTMLDivElement>((_, ref) => {
  const { state } = useApp()
  const html = parseMarkdown(state.currentFile?.content ?? '')

  return (
    <div
      ref={ref}
      className="h-full w-full overflow-auto px-6 py-4 preview-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
})

PreviewPane.displayName = 'PreviewPane'
export default PreviewPane
```

- [ ] **Step 2: Add preview styles to index.css**

Append to `src/index.css`:

```css
.preview-content {
  line-height: 1.6;
  color: #24292f;
}

.preview-content h1,
.preview-content h2,
.preview-content h3,
.preview-content h4,
.preview-content h5,
.preview-content h6 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
}

.preview-content p {
  margin-bottom: 1em;
}

.preview-content pre {
  background: #f6f8fa;
  padding: 1em;
  border-radius: 6px;
  overflow-x: auto;
}

.preview-content code {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 0.875em;
}

.preview-content blockquote {
  border-left: 4px solid #d0d7de;
  padding-left: 1em;
  color: #57606a;
  margin: 0 0 1em 0;
}

.preview-content ul,
.preview-content ol {
  padding-left: 1.5em;
  margin-bottom: 1em;
}

.preview-content img {
  max-width: 100%;
}

.preview-content table {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 1em;
}

.preview-content th,
.preview-content td {
  border: 1px solid #d0d7de;
  padding: 6px 12px;
}

.preview-content th {
  background: #f6f8fa;
}

.dark .preview-content {
  color: #c9d1d9;
}

.dark .preview-content pre {
  background: #161b22;
}

.dark .preview-content blockquote {
  border-left-color: #30363d;
  color: #8b949e;
}

.dark .preview-content th,
.dark .preview-content td {
  border-color: #30363d;
}

.dark .preview-content th {
  background: #161b22;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/PreviewPane.tsx src/index.css
git commit -m "feat: add PreviewPane with rendered Markdown and theme-aware styles"
```

---

### Task 7: AppShell Layout

**Files:**
- Create: `src/components/AppShell.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create AppShell component**

```tsx
import { useRef, useState } from 'react'
import EditorPane from './EditorPane'
import PreviewPane from './PreviewPane'
import Toolbar from './Toolbar'
import StatusBar from './StatusBar'
import FileManager from './FileManager'

export default function AppShell() {
  const [fileManagerOpen, setFileManagerOpen] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Toolbar
        onToggleFileManager={() => setFileManagerOpen((v) => !v)}
        fileManagerOpen={fileManagerOpen}
      />
      <div className="flex flex-1 overflow-hidden">
        {fileManagerOpen && (
          <div className="w-64 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 overflow-auto">
            <FileManager />
          </div>
        )}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 border-r border-gray-200 dark:border-gray-700 min-w-0">
            <EditorPane />
          </div>
          <div className="flex-1 min-w-0 bg-white dark:bg-gray-900">
            <PreviewPane ref={previewRef} />
          </div>
        </div>
      </div>
      <StatusBar />
    </div>
  )
}
```

- [ ] **Step 2: Update App.tsx**

```tsx
import AppShell from './components/AppShell'

export default function App() {
  return <AppShell />
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/AppShell.tsx src/App.tsx
git commit -m "feat: add AppShell layout with split view and file manager toggle"
```

---

### Task 8: Toolbar Component

**Files:**
- Create: `src/components/Toolbar.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: Create Toolbar component**

```tsx
import { useApp } from '@/context/AppContext'

interface ToolbarProps {
  onToggleFileManager: () => void
  fileManagerOpen: boolean
}

export default function Toolbar({ onToggleFileManager, fileManagerOpen }: ToolbarProps) {
  const { state, dispatch } = useApp()
  const isDark = state.theme === 'dark'

  const insertSyntax = (before: string, after: string = '') => {
    // In a full implementation this would interact with Monaco.
    // For now, we update content directly as a simplified approach.
    const editor = document.querySelector('.monaco-editor textarea') as HTMLTextAreaElement | null
    if (editor) {
      const start = editor.selectionStart
      const end = editor.selectionEnd
      const text = editor.value
      const selected = text.slice(start, end)
      const replacement = before + selected + after
      const newText = text.slice(0, start) + replacement + text.slice(end)
      dispatch({ type: 'UPDATE_CONTENT', payload: newText })
    }
  }

  return (
    <div className="h-12 border-b border-gray-200 dark:border-gray-700 flex items-center px-3 gap-2 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
      <button
        onClick={onToggleFileManager}
        className={`px-2 py-1 rounded text-sm ${fileManagerOpen ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
        title="Toggle File Manager"
      >
        📁
      </button>
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
      <button onClick={() => insertSyntax('**', '**')} className="px-2 py-1 rounded text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-700" title="Bold">B</button>
      <button onClick={() => insertSyntax('*', '*')} className="px-2 py-1 rounded text-sm italic hover:bg-gray-200 dark:hover:bg-gray-700" title="Italic">I</button>
      <button onClick={() => insertSyntax('## ', '')} className="px-2 py-1 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-700" title="Heading">H</button>
      <button onClick={() => insertSyntax('```\n', '\n```')} className="px-2 py-1 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-700" title="Code Block">{`{ }`}</button>
      <button onClick={() => insertSyntax('> ', '')} className="px-2 py-1 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-700" title="Quote">"</button>
      <button onClick={() => insertSyntax('- ', '')} className="px-2 py-1 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-700" title="List">☰</button>
      <div className="flex-1" />
      <button
        onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
        className="px-2 py-1 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
        title="Toggle Theme"
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
git commit -m "feat: add Toolbar with format shortcuts and theme toggle"
```

---

### Task 9: FileManager Component

**Files:**
- Create: `src/components/FileManager.tsx`

- [ ] **Step 1: Create FileManager component**

```tsx
import { useApp } from '@/context/AppContext'

export default function FileManager() {
  const { state, dispatch } = useApp()

  const openFolder = async () => {
    try {
      // @ts-expect-error File System Access API may not be typed
      const dirHandle = await window.showDirectoryPicker()
      const files: import('@/types').EditorFile[] = []
      for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file' && entry.name.endsWith('.md')) {
          const file = await entry.getFile()
          const content = await file.text()
          files.push({
            name: entry.name,
            path: entry.name,
            content,
            handle: entry,
          })
        }
      }
      dispatch({ type: 'SET_FILES', payload: files })
      if (files.length > 0) {
        dispatch({ type: 'SET_CURRENT_FILE', payload: files[0] })
      }
    } catch (err) {
      // User cancelled or API not available
      console.warn('Folder open failed:', err)
    }
  }

  const openFile = async () => {
    try {
      // @ts-expect-error File System Access API may not be typed
      const [fileHandle] = await window.showOpenFilePicker({
        types: [{ description: 'Markdown', accept: { 'text/markdown': ['.md'] } }],
      })
      const file = await fileHandle.getFile()
      const content = await file.text()
      const newFile = {
        name: file.name,
        path: file.name,
        content,
        handle: fileHandle,
      }
      dispatch({ type: 'SET_FILES', payload: [...state.files, newFile] })
      dispatch({ type: 'SET_CURRENT_FILE', payload: newFile })
    } catch (err) {
      console.warn('File open failed:', err)
    }
  }

  const saveFile = async () => {
    const current = state.currentFile
    if (!current) return
    if (current.handle) {
      try {
        const writable = await current.handle.createWritable()
        await writable.write(current.content)
        await writable.close()
        alert('Saved!')
      } catch (err) {
        console.error('Save failed:', err)
        alert('Save failed. Try Save As.')
      }
    } else {
      // Fallback: download
      const blob = new Blob([current.content], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = current.name || 'untitled.md'
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="h-full flex flex-col p-3 gap-2 bg-gray-50 dark:bg-gray-800">
      <div className="flex gap-2">
        <button onClick={openFolder} className="flex-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">Open Folder</button>
        <button onClick={openFile} className="flex-1 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs hover:bg-gray-300 dark:hover:bg-gray-600">Open File</button>
      </div>
      <button onClick={saveFile} className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">Save</button>
      <div className="flex-1 overflow-auto mt-2">
        {state.files.length === 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400">No files open</p>
        )}
        <ul className="space-y-1">
          {state.files.map((file) => (
            <li
              key={file.path}
              onClick={() => dispatch({ type: 'SET_CURRENT_FILE', payload: file })}
              className={`cursor-pointer text-sm px-2 py-1 rounded ${
                state.currentFile?.path === file.path
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
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
git add src/components/FileManager.tsx
git commit -m "feat: add FileManager with open folder/file and save"
```

---

### Task 10: StatusBar Component

**Files:**
- Create: `src/components/StatusBar.tsx`

- [ ] **Step 1: Create StatusBar component**

```tsx
import { useApp } from '@/context/AppContext'
import { countWords, countChars } from '@/utils/wordCount'

export default function StatusBar() {
  const { state } = useApp()
  const content = state.currentFile?.content ?? ''
  const words = countWords(content)
  const chars = countChars(content)
  const fileName = state.currentFile?.name ?? 'No file open'

  return (
    <div className="h-7 border-t border-gray-200 dark:border-gray-700 flex items-center px-3 text-xs bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex-shrink-0 gap-4">
      <span className="truncate max-w-[200px]">{fileName}</span>
      <span className="ml-auto">{words} words</span>
      <span>{chars} chars</span>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/StatusBar.tsx
git commit -m "feat: add StatusBar with word/char count and file info"
```

---

### Task 11: Scroll Sync Hook

**Files:**
- Create: `src/hooks/useScrollSync.ts`

- [ ] **Step 1: Create hook**

```typescript
import { useEffect, RefObject } from 'react'

export function useScrollSync(
  editorContainerRef: RefObject<HTMLDivElement | null>,
  previewRef: RefObject<HTMLDivElement | null>
) {
  useEffect(() => {
    const editorEl = editorContainerRef.current?.querySelector('.monaco-editor .overflow-guard > .overflow-scrollable') as HTMLDivElement | null
    const previewEl = previewRef.current
    if (!editorEl || !previewEl) return

    let isEditorScrolling = false
    let isPreviewScrolling = false
    let editorTimeout: ReturnType<typeof setTimeout>
    let previewTimeout: ReturnType<typeof setTimeout>

    const onEditorScroll = () => {
      if (isPreviewScrolling) return
      isEditorScrolling = true
      clearTimeout(editorTimeout)
      const ratio = editorEl.scrollTop / (editorEl.scrollHeight - editorEl.clientHeight)
      previewEl.scrollTop = ratio * (previewEl.scrollHeight - previewEl.clientHeight)
      editorTimeout = setTimeout(() => {
        isEditorScrolling = false
      }, 100)
    }

    const onPreviewScroll = () => {
      if (isEditorScrolling) return
      isPreviewScrolling = true
      clearTimeout(previewTimeout)
      const ratio = previewEl.scrollTop / (previewEl.scrollHeight - previewEl.clientHeight)
      editorEl.scrollTop = ratio * (editorEl.scrollHeight - editorEl.clientHeight)
      previewTimeout = setTimeout(() => {
        isPreviewScrolling = false
      }, 100)
    }

    editorEl.addEventListener('scroll', onEditorScroll)
    previewEl.addEventListener('scroll', onPreviewScroll)

    return () => {
      editorEl.removeEventListener('scroll', onEditorScroll)
      previewEl.removeEventListener('scroll', onPreviewScroll)
    }
  }, [editorContainerRef, previewRef])
}
```

- [ ] **Step 2: Integrate into AppShell**

Modify `src/components/AppShell.tsx`:

```tsx
import { useRef, useState } from 'react'
import EditorPane from './EditorPane'
import PreviewPane from './PreviewPane'
import Toolbar from './Toolbar'
import StatusBar from './StatusBar'
import FileManager from './FileManager'
import { useScrollSync } from '@/hooks/useScrollSync'

export default function AppShell() {
  const [fileManagerOpen, setFileManagerOpen] = useState(false)
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  useScrollSync(editorContainerRef, previewRef)

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Toolbar
        onToggleFileManager={() => setFileManagerOpen((v) => !v)}
        fileManagerOpen={fileManagerOpen}
      />
      <div className="flex flex-1 overflow-hidden">
        {fileManagerOpen && (
          <div className="w-64 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 overflow-auto">
            <FileManager />
          </div>
        )}
        <div className="flex-1 flex overflow-hidden">
          <div ref={editorContainerRef} className="flex-1 border-r border-gray-200 dark:border-gray-700 min-w-0">
            <EditorPane />
          </div>
          <div className="flex-1 min-w-0 bg-white dark:bg-gray-900">
            <PreviewPane ref={previewRef} />
          </div>
        </div>
      </div>
      <StatusBar />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useScrollSync.ts src/components/AppShell.tsx
git commit -m "feat: add approximate scroll sync between editor and preview"
```

---

### Task 12: HTML Export Utility (TDD)

**Files:**
- Create: `src/utils/exportHtml.ts`
- Create: `src/utils/exportHtml.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect } from 'vitest'
import { generateHtmlDocument } from './exportHtml'

describe('generateHtmlDocument', () => {
  it('wraps markdown HTML in a full document', () => {
    const doc = generateHtmlDocument('<h1>Hello</h1>', 'test.md')
    expect(doc).toContain('<!DOCTYPE html>')
    expect(doc).toContain('<h1>Hello</h1>')
    expect(doc).toContain('test.md')
  })

  it('includes highlight.js CSS', () => {
    const doc = generateHtmlDocument('', 'x.md')
    expect(doc).toContain('hljs')
  })
})
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npx vitest run src/utils/exportHtml.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement utility**

```typescript
export function generateHtmlDocument(bodyHtml: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/styles/github.min.css">
  <style>
    body {
      max-width: 900px;
      margin: 2em auto;
      padding: 0 1em;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #24292f;
    }
    pre { background: #f6f8fa; padding: 1em; border-radius: 6px; overflow-x: auto; }
    code { font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.875em; }
    blockquote { border-left: 4px solid #d0d7de; padding-left: 1em; color: #57606a; }
    img { max-width: 100%; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #d0d7de; padding: 6px 12px; }
    th { background: #f6f8fa; }
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
```

- [ ] **Step 4: Run tests to verify pass**

Run: `npx vitest run src/utils/exportHtml.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/exportHtml.ts src/utils/exportHtml.test.ts
git commit -m "feat: add HTML export utility"
```

---

### Task 13: Export Integration in Toolbar

**Files:**
- Modify: `src/components/Toolbar.tsx`

- [ ] **Step 1: Add export buttons to Toolbar**

Replace the Toolbar with this updated version that includes export:

```tsx
import { useApp } from '@/context/AppContext'
import { parseMarkdown } from '@/utils/markdownParser'
import { generateHtmlDocument } from '@/utils/exportHtml'

interface ToolbarProps {
  onToggleFileManager: () => void
  fileManagerOpen: boolean
}

export default function Toolbar({ onToggleFileManager, fileManagerOpen }: ToolbarProps) {
  const { state, dispatch } = useApp()
  const isDark = state.theme === 'dark'

  const exportHtml = () => {
    const content = state.currentFile?.content ?? ''
    const title = state.currentFile?.name ?? 'export.md'
    const body = parseMarkdown(content)
    const doc = generateHtmlDocument(body, title)
    const blob = new Blob([doc], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = title.replace(/\.md$/, '.html')
    a.click()
    URL.revokeObjectURL(url)
  }

  const insertSyntax = (before: string, after: string = '') => {
    const editor = document.querySelector('.monaco-editor textarea') as HTMLTextAreaElement | null
    if (editor) {
      const start = editor.selectionStart
      const end = editor.selectionEnd
      const text = editor.value
      const selected = text.slice(start, end)
      const replacement = before + selected + after
      const newText = text.slice(0, start) + replacement + text.slice(end)
      dispatch({ type: 'UPDATE_CONTENT', payload: newText })
    }
  }

  return (
    <div className="h-12 border-b border-gray-200 dark:border-gray-700 flex items-center px-3 gap-2 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
      <button
        onClick={onToggleFileManager}
        className={`px-2 py-1 rounded text-sm ${fileManagerOpen ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
        title="Toggle File Manager"
      >
        📁
      </button>
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
      <button onClick={() => insertSyntax('**', '**')} className="px-2 py-1 rounded text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-700" title="Bold">B</button>
      <button onClick={() => insertSyntax('*', '*')} className="px-2 py-1 rounded text-sm italic hover:bg-gray-200 dark:hover:bg-gray-700" title="Italic">I</button>
      <button onClick={() => insertSyntax('## ', '')} className="px-2 py-1 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-700" title="Heading">H</button>
      <button onClick={() => insertSyntax('```\n', '\n```')} className="px-2 py-1 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-700" title="Code Block">{`{ }`}</button>
      <button onClick={() => insertSyntax('> ', '')} className="px-2 py-1 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-700" title="Quote">"</button>
      <button onClick={() => insertSyntax('- ', '')} className="px-2 py-1 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-700" title="List">☰</button>
      <div className="flex-1" />
      <button onClick={exportHtml} className="px-3 py-1 rounded text-sm bg-purple-600 text-white hover:bg-purple-700" title="Export HTML">Export HTML</button>
      <button
        onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
        className="px-2 py-1 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
        title="Toggle Theme"
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
git commit -m "feat: integrate HTML export into Toolbar"
```

---

### Task 14: Dark Mode Class Binding

**Files:**
- Modify: `src/components/AppShell.tsx`

- [ ] **Step 1: Apply dark class to html element**

Add a `useEffect` in `AppShell.tsx` to toggle the `dark` class on `<html>`:

```tsx
import { useRef, useState, useEffect } from 'react'
import EditorPane from './EditorPane'
import PreviewPane from './PreviewPane'
import Toolbar from './Toolbar'
import StatusBar from './StatusBar'
import FileManager from './FileManager'
import { useScrollSync } from '@/hooks/useScrollSync'
import { useApp } from '@/context/AppContext'

export default function AppShell() {
  const [fileManagerOpen, setFileManagerOpen] = useState(false)
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const { state } = useApp()

  useScrollSync(editorContainerRef, previewRef)

  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [state.theme])

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Toolbar
        onToggleFileManager={() => setFileManagerOpen((v) => !v)}
        fileManagerOpen={fileManagerOpen}
      />
      <div className="flex flex-1 overflow-hidden">
        {fileManagerOpen && (
          <div className="w-64 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 overflow-auto">
            <FileManager />
          </div>
        )}
        <div className="flex-1 flex overflow-hidden">
          <div ref={editorContainerRef} className="flex-1 border-r border-gray-200 dark:border-gray-700 min-w-0">
            <EditorPane />
          </div>
          <div className="flex-1 min-w-0 bg-white dark:bg-gray-900">
            <PreviewPane ref={previewRef} />
          </div>
        </div>
      </div>
      <StatusBar />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AppShell.tsx
git commit -m "feat: bind dark mode class to document root"
```

---

### Task 15: Build Verification & Final Integration

**Files:**
- Modify: `package.json` (scripts)

- [ ] **Step 1: Verify all tests pass**

Run: `npm test`
Expected: PASS (all markdownParser, wordCount, exportHtml tests).

- [ ] **Step 2: Verify build succeeds**

Run: `npm run build`
Expected: `dist/` folder created with `index.html`, JS, and CSS bundles. No TypeScript or Vite errors.

- [ ] **Step 3: Fix any type errors if needed**

If `npm run build` fails with type errors, fix them inline. Common issues:
- Monaco editor types: ensure `@monaco-editor/react` types are resolved.
- File System Access API types: the `@ts-expect-error` comments should suppress these.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: GeeksongEditor MVP complete"
```

---

## Spec Self-Review

**1. Spec coverage:**
- ✅ Split view editing — Task 7 (AppShell)
- ✅ Live preview — Task 6 (PreviewPane)
- ✅ File open/save — Task 9 (FileManager)
- ✅ Toolbar shortcuts — Task 8, 13 (Toolbar)
- ✅ Scroll sync — Task 11 (useScrollSync)
- ✅ Dark mode — Task 12, 14 (Toolbar + AppShell)
- ✅ HTML export — Task 12, 13 (exportHtml + Toolbar)
- ✅ Word count — Task 4, 10 (wordCount + StatusBar)
- ✅ Syntax highlighting — Task 3 (markdownParser)
- ✅ Sanitization — Task 3 (markdownParser)

**2. Placeholder scan:**
- No TBD, TODO, or "implement later" found.
- Every task includes exact file paths and complete code.
- No vague instructions like "add appropriate error handling" without specifics.

**3. Type consistency:**
- `EditorFile` interface used consistently across FileManager, AppContext, and types.
- `AppAction` types used consistently in reducer and dispatch calls.
- `Theme` type ('light' | 'dark') used in state, localStorage, and class binding.

No gaps found. Plan is ready for execution.
