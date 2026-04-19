import { describe, it, expect } from 'vitest'
import { transformMermaidBlocks, postProcessHtml } from './previewRender'

describe('transformMermaidBlocks', () => {
  it('converts mermaid code block to mermaid pre', () => {
    const input = '<pre><code class="language-mermaid">graph TD; A-->B;</code></pre>'
    const output = transformMermaidBlocks(input)
    expect(output).toBe('<pre class="mermaid">graph TD; A-->B;</pre>')
  })

  it('handles multiline mermaid content', () => {
    const input = `<pre><code class="language-mermaid">graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action]
    B -->|No| D[End]
</code></pre>`
    const output = transformMermaidBlocks(input)
    expect(output).toContain('<pre class="mermaid">')
    expect(output).toContain('graph TD')
    expect(output).not.toContain('<code')
  })

  it('leaves non-mermaid code blocks untouched', () => {
    const input = '<pre><code class="language-rust">let x = 1;</code></pre>'
    const output = transformMermaidBlocks(input)
    expect(output).toBe(input)
  })

  it('handles multiple mermaid blocks', () => {
    const input = `
      <pre><code class="language-mermaid">graph TD; A-->B;</code></pre>
      <p>some text</p>
      <pre><code class="language-mermaid">graph LR; X-->Y;</code></pre>
    `
    const output = transformMermaidBlocks(input)
    const matches = output.match(/<pre class="mermaid">/g)
    expect(matches?.length).toBe(2)
  })
})

describe('postProcessHtml', () => {
  it('applies all transformations', () => {
    const input = '<pre><code class="language-mermaid">graph TD;</code></pre>'
    const output = postProcessHtml(input)
    expect(output).toBe('<pre class="mermaid">graph TD;</pre>')
  })
})
