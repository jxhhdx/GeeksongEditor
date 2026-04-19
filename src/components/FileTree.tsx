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
