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
