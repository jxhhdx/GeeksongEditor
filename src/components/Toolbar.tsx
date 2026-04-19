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
