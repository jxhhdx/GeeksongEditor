import { forwardRef, useEffect } from 'react'
import DOMPurify from 'dompurify'
import { postProcessHtml } from '../utils/previewRender'

interface PreviewProps {
  html: string
}

const Preview = forwardRef<HTMLDivElement, PreviewProps>(({ html }, ref) => {
  const processed = postProcessHtml(html)
  const clean = DOMPurify.sanitize(processed, { USE_PROFILES: { html: true } })

  useEffect(() => {
    const el = ref && 'current' in ref ? ref.current : null
    if (!el) return

    // Render KaTeX math
    const renderMath = () => {
      const win = window as typeof window & {
        renderMathInElement?: (el: HTMLElement, opts: Record<string, unknown>) => void
      }
      if (win.renderMathInElement) {
        win.renderMathInElement(el, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
          ],
          throwOnError: false,
        })
      }
    }

    // Render Mermaid diagrams
    const renderMermaid = async () => {
      const win = window as typeof window & {
        mermaid?: {
          run: (opts: { querySelector: string }) => Promise<void>
        }
      }
      if (win.mermaid) {
        try {
          await win.mermaid.run({ querySelector: '.mermaid' })
        } catch {
          // Mermaid may fail if no diagrams found; ignore
        }
      }
    }

    // Delay slightly to ensure DOM is ready
    const timer = setTimeout(() => {
      renderMath()
      renderMermaid()
    }, 50)

    return () => clearTimeout(timer)
  }, [html, ref])

  return (
    <div
      ref={ref}
      className="h-full w-full overflow-auto px-6 py-4 preview-content"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  )
})

Preview.displayName = 'Preview'
export default Preview
