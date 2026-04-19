import { useEffect, useRef } from 'react'
import { EditorView, keymap } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
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

    const baseTheme = EditorView.theme({
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
      '.cm-cursor': {
        borderLeftColor: theme === 'dark' ? '#c9d1d9' : '#24292f',
      },
      '.cm-selectionBackground': {
        backgroundColor: theme === 'dark' ? '#264f78' : '#add6ff',
      },
    })

    const extensions = [
      markdown(),
      keymap.of([
        { key: 'Tab', run: (view) => { view.dispatch(view.state.replaceSelection('  ')); return true } },
      ]),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChange(update.state.doc.toString())
        }
      }),
      baseTheme,
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

  useEffect(() => {
    const view = viewRef.current
    if (!view || view.state.doc.toString() === content) return
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: content },
    })
  }, [content])

  return <div ref={editorRef} className="h-full w-full" />
}
