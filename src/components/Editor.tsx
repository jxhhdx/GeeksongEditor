import { useEffect, useRef } from 'react'
import { basicSetup } from 'codemirror'
import { EditorView } from '@codemirror/view'
import { markdown } from '@codemirror/lang-markdown'

interface EditorProps {
  content: string
  onChange: (value: string) => void
  theme?: 'light' | 'dark'
}

export default function Editor({ content, onChange, theme = 'light' }: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)

  useEffect(() => {
    if (!editorRef.current) return

    const view = new EditorView({
      doc: content,
      extensions: [
        basicSetup,
        markdown(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString())
          }
        }),
      ],
      parent: editorRef.current,
    })

    viewRef.current = view

    requestAnimationFrame(() => {
      view.focus()
    })

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [theme])

  useEffect(() => {
    const view = viewRef.current
    if (!view || view.state.doc.toString() === content) return
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: content },
    })
  }, [content])

  return (
    <div
      ref={editorRef}
      className="h-full w-full relative"
      data-theme={theme}
      onClick={() => viewRef.current?.focus()}
    />
  )
}
