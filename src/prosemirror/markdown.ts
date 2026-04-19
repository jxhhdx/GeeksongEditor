import MarkdownIt from 'markdown-it'
import { MarkdownParser, MarkdownSerializer } from 'prosemirror-markdown'
import { defaultMarkdownParser, defaultMarkdownSerializer } from 'prosemirror-markdown'
import { markdownSchema } from './schema'

// Configure markdown-it with GFM
const md = new MarkdownIt('default', {
  html: false,
  breaks: true,
  linkify: true,
})

// Enable GFM table support
md.enable('table')

// --- Parser ---

// Start from default tokens and add/override for our custom schema
const tokens: Record<string, any> = {
  ...defaultMarkdownParser.tokens,

  // Task list support - markdown-it GFM uses checkbox in token info
  list_item: {
    block: 'list_item',
    getAttrs: (_tok: any, tokenStream: any, i: number) => {
      // Check if previous token is inline with checkbox
      const inlineTok = tokenStream[i + 1]
      if (inlineTok && inlineTok.type === 'inline' && inlineTok.content.startsWith('[ ] ')) {
        return { checked: false }
      }
      if (inlineTok && inlineTok.type === 'inline' && inlineTok.content.startsWith('[x] ')) {
        return { checked: true }
      }
      return { checked: null }
    },
  },

  // Table support - we need custom handlers since tables don't fit simple block/node/mark model
}

// Build token handlers manually for table support
// We override the parser to handle table tokens
export const markdownParser = new MarkdownParser(markdownSchema, md, tokens)

// Override table token handlers after construction
const originalHandlers = (markdownParser as any).tokenHandlers

originalHandlers.table_open = (state: any) => {
  state.openNode(markdownSchema.nodes.table)
}
originalHandlers.table_close = (state: any) => {
  state.closeNode()
}
originalHandlers.thead_open = () => {}
originalHandlers.thead_close = () => {}
originalHandlers.tbody_open = () => {}
originalHandlers.tbody_close = () => {}
originalHandlers.tr_open = () => {}
originalHandlers.tr_close = (state: any, token: any, tokens: any, _i: number) => {
  const start = token.map?.[0] || 0
  const end = token.map?.[1] || 0
  const cells: any[] = []

  for (let idx = start; idx < end; idx++) {
    const t = tokens[idx]
    if (t.type === 'th_open' || t.type === 'td_open') {
      const cellType = t.type === 'th_open' ? 'table_header' : 'table_cell'
      const closeType = t.type === 'th_open' ? 'th_close' : 'td_close'
      const contentStart = idx + 1
      let contentEnd = contentStart
      while (contentEnd < end && tokens[contentEnd].type !== closeType) contentEnd++

      const inlineTokens = tokens.slice(contentStart, contentEnd)
      const content = state.parser.parseInline(inlineTokens)
      cells.push(markdownSchema.nodes[cellType].create(null, content))
      idx = contentEnd
    }
  }

  state.addNode(markdownSchema.nodes.table_row, null, cells)
}
originalHandlers.th_open = () => {}
originalHandlers.th_close = () => {}
originalHandlers.td_open = () => {}
originalHandlers.td_close = () => {}

// --- Serializer ---

const nodes: Record<string, any> = {
  ...defaultMarkdownSerializer.nodes,

  table: (state: any, node: any) => {
    const rows: string[][] = []
    const alignments: string[] = []

    node.forEach((rowNode: any) => {
      const cells: string[] = []
      rowNode.forEach((cellNode: any, _offset: number, _index: number) => {
        const inner = state.serializeInline(cellNode)
        cells.push(inner)
        if (rows.length === 0) {
          alignments.push('---')
        }
      })
      rows.push(cells)
    })

    if (rows.length === 0) return

    state.write('| ' + rows[0].join(' | ') + ' |\n')
    state.write('| ' + alignments.join(' | ') + ' |\n')
    for (let i = 1; i < rows.length; i++) {
      state.write('| ' + rows[i].join(' | ') + ' |\n')
    }
    state.closeBlock(node)
  },

  table_row: () => {},
  table_cell: () => {},
  table_header: () => {},

  list_item: (state: any, node: any) => {
    const { checked } = node.attrs
    if (checked !== null && checked !== undefined) {
      state.write(checked ? '[x] ' : '[ ] ')
    }
    state.renderContent(node)
  },

  code_block: (state: any, node: any) => {
    state.write('```' + (node.attrs.language || '') + '\n')
    state.text(node.textContent, false)
    state.ensureNewLine()
    state.write('```')
    state.closeBlock(node)
  },
}

const marks: Record<string, any> = {
  ...defaultMarkdownSerializer.marks,

  strike: {
    open: '~~',
    close: '~~',
    mixable: true,
    expelEnclosingWhitespace: true,
  },
}

export const markdownSerializer = new MarkdownSerializer(nodes, marks)

export function parseMarkdown(content: string) {
  return markdownParser.parse(content)
}

export function serializeMarkdown(doc: any) {
  return markdownSerializer.serialize(doc)
}
