import { useState, useEffect, useRef, useCallback } from 'react'
import Editor from './components/Editor'
import Preview from './components/Preview'
import WysiwygEditor from './components/WysiwygEditor'
import Toolbar from './components/Toolbar'
import FileTree from './components/FileTree'
import StatusBar from './components/StatusBar'
import { useScrollSync } from './hooks/useScrollSync'
import { renderMarkdown, readFile, writeFile, exportHtml } from './utils/tauri'
import type { MdFile } from './utils/tauri'
import { save } from '@tauri-apps/plugin-dialog'
import { countWords, countChars } from './utils/wordCount'

export default function App() {
  const [content, setContent] = useState(`# GeeksongEditor 使用示例

## 基础排版

**粗体文字**、*斜体文字*、~~删除线~~。

> 这是一段引用文字，用于强调或引用他人的观点。

## 列表示例

### 无序列表
- 项目一
- 项目二
- 项目三

### 有序列表
1. 第一步
2. 第二步
3. 第三步

### 任务列表
- [x] 已完成：搭建项目骨架
- [x] 已完成：实现 Markdown 实时预览
- [ ] 待办：添加更多扩展语法

## 表格示例

| 功能 | 状态 | 说明 |
|------|------|------|
| 标题 | ✅ | H1 ~ H6 全支持 |
| 表格 | ✅ | 标准 GFM 表格 |
| 任务列表 | ✅ | 复选框列表 |
| 流程图 | ✅ | Mermaid 语法 |
| 数学公式 | ✅ | KaTeX 渲染 |

## 代码块

\`\`\`rust
fn main() {
    println!("Hello, GeeksongEditor!");
}
\`\`\`

## 流程图（Mermaid）

\`\`\`mermaid
graph TD
    A[开始] --> B{是否需要流程图?}
    B -->|是| C[使用 Mermaid]
    B -->|否| D[继续写作]
    C --> E[渲染成功]
    D --> E
    E --> F[结束]
\`\`\`

\`\`\`mermaid
sequenceDiagram
    用户->>编辑器: 输入 Markdown
    编辑器->>Rust: 调用 render_markdown
    Rust-->>编辑器: 返回 HTML
    编辑器->>预览区: 渲染预览
\`\`\`

## 数学公式（KaTeX）

行内公式：质能方程 $E = mc^2$ 是爱因斯坦提出的。

块级公式：

$$
\\int_{a}^{b} f(x) \\, dx = F(b) - F(a)
$$

$$
\\sum_{i=1}^{n} x_i = x_1 + x_2 + \\cdots + x_n
$$

$$
\\begin{pmatrix}
a & b \\\\
c & d
\\end{pmatrix}
\\begin{pmatrix}
x \\\\
y
\\end{pmatrix}
=
\\begin{pmatrix}
ax + by \\\\
cx + dy
\\end{pmatrix}
$$

---

*祝你写作愉快！*
`)
  const [previewHtml, setPreviewHtml] = useState('')
  const [files, setFiles] = useState<MdFile[]>([])
  const [currentFile, setCurrentFile] = useState<MdFile | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isDark, setIsDark] = useState(false)
  const [saved, setSaved] = useState(true)
  const [editorMode, setEditorMode] = useState<'split' | 'wysiwyg'>('split')

  const editorContainerRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  useScrollSync(editorContainerRef, previewRef)

  const handleToggleMode = useCallback(() => {
    setEditorMode((prev) => (prev === 'split' ? 'wysiwyg' : 'split'))
  }, [])

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

  useEffect(() => {
    renderMarkdown(content).then((r) => setPreviewHtml(r.html))
  }, [])

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
        editorMode={editorMode}
        onToggleMode={handleToggleMode}
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

        {editorMode === 'split' ? (
          <div className="flex-1 flex overflow-hidden">
            <div ref={editorContainerRef} className="flex-1 border-r border-[var(--color-border)] dark:border-[var(--color-border-dark)] min-w-0">
              <Editor content={content} onChange={handleChange} theme={isDark ? 'dark' : 'light'} />
            </div>
            <div className="flex-1 min-w-0 bg-[var(--color-bg)] dark:bg-[var(--color-bg-dark)]">
              <Preview html={previewHtml} ref={previewRef} />
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <WysiwygEditor content={content} onChange={handleChange} theme={isDark ? 'dark' : 'light'} />
          </div>
        )}
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
