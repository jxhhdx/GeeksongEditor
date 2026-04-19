import { useEffect, useRef } from 'react'
import { EditorView } from 'prosemirror-view'
import { EditorState } from 'prosemirror-state'
import { keymap } from 'prosemirror-keymap'
import { toggleMark, setBlockType, wrapIn } from 'prosemirror-commands'
import { markdownSchema } from '../prosemirror/schema'
import { parseMarkdown, serializeMarkdown } from '../prosemirror/markdown'
import 'prosemirror-view/style/prosemirror.css'

interface WysiwygEditorProps {
  content: string
  onChange: (value: string) => void
  theme?: 'light' | 'dark'
}

export default function WysiwygEditor({ content, onChange, theme = 'light' }: WysiwygEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)

  useEffect(() => {
    if (!editorRef.current) return

    const doc = parseMarkdown(content)

    const state = EditorState.create({
      doc,
      schema: markdownSchema,
      plugins: [
        keymap({
          'Mod-b': toggleMark(markdownSchema.marks.strong),
          'Mod-i': toggleMark(markdownSchema.marks.em),
          'Mod-`': toggleMark(markdownSchema.marks.code),
          'Shift-Ctrl-8': wrapIn(markdownSchema.nodes.bullet_list),
          'Shift-Ctrl-9': wrapIn(markdownSchema.nodes.ordered_list),
          'Shift-Ctrl-0': setBlockType(markdownSchema.nodes.paragraph),
          'Shift-Ctrl-1': setBlockType(markdownSchema.nodes.heading, { level: 1 }),
          'Shift-Ctrl-2': setBlockType(markdownSchema.nodes.heading, { level: 2 }),
          'Shift-Ctrl-3': setBlockType(markdownSchema.nodes.heading, { level: 3 }),
          'Shift-Ctrl-4': setBlockType(markdownSchema.nodes.heading, { level: 4 }),
          'Shift-Ctrl-5': setBlockType(markdownSchema.nodes.heading, { level: 5 }),
          'Shift-Ctrl-6': setBlockType(markdownSchema.nodes.heading, { level: 6 }),
        }),
      ],
    })

    const view = new EditorView(editorRef.current, {
      state,
      dispatchTransaction(tr) {
        const newState = view.state.apply(tr)
        view.updateState(newState)
        if (tr.docChanged) {
          const md = serializeMarkdown(newState.doc)
          onChange(md)
        }
      },
    })

    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [theme])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const currentMd = serializeMarkdown(view.state.doc)
    if (currentMd !== content) {
      const newDoc = parseMarkdown(content)
      const tr = view.state.tr
      tr.replaceWith(0, view.state.doc.content.size, newDoc.content)
      view.dispatch(tr)
    }
  }, [content])

  return (
    <div
      ref={editorRef}
      className="h-full w-full overflow-auto"
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', Roboto, sans-serif",
        fontSize: '16px',
        lineHeight: '1.6',
      }}
      onClick={() => viewRef.current?.focus()}
    />
  )
}
