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
