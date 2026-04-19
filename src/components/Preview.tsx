import { forwardRef } from 'react'
import DOMPurify from 'dompurify'

interface PreviewProps {
  html: string
}

const Preview = forwardRef<HTMLDivElement, PreviewProps>(({ html }, ref) => {
  const clean = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })

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
