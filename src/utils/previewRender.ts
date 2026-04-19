/**
 * Transform pulldown-cmark's mermaid code blocks into Mermaid-compatible HTML.
 * pulldown-cmark outputs: <pre><code class="language-mermaid">...</code></pre>
 * Mermaid expects: <pre class="mermaid">...</pre>
 */
export function transformMermaidBlocks(html: string): string {
  return html.replace(
    /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
    '<pre class="mermaid">$1</pre>',
  )
}

/**
 * Post-process rendered Markdown HTML for Mermaid and KaTeX rendering.
 */
export function postProcessHtml(html: string): string {
  return transformMermaidBlocks(html)
}
