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
