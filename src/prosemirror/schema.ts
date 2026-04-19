import { Schema, NodeSpec, MarkSpec } from 'prosemirror-model'

const nodes: Record<string, NodeSpec> = {
  doc: { content: 'block+' },

  paragraph: {
    content: 'inline*',
    group: 'block',
    parseDOM: [{ tag: 'p' }],
    toDOM: () => ['p', 0],
  },

  blockquote: {
    content: 'block+',
    group: 'block',
    parseDOM: [{ tag: 'blockquote' }],
    toDOM: () => ['blockquote', 0],
  },

  horizontal_rule: {
    group: 'block',
    parseDOM: [{ tag: 'hr' }],
    toDOM: () => ['hr'],
  },

  heading: {
    attrs: { level: { default: 1 } },
    content: 'inline*',
    group: 'block',
    defining: true,
    parseDOM: [
      { tag: 'h1', attrs: { level: 1 } },
      { tag: 'h2', attrs: { level: 2 } },
      { tag: 'h3', attrs: { level: 3 } },
      { tag: 'h4', attrs: { level: 4 } },
      { tag: 'h5', attrs: { level: 5 } },
      { tag: 'h6', attrs: { level: 6 } },
    ],
    toDOM: (node) => ['h' + node.attrs.level, 0],
  },

  code_block: {
    content: 'text*',
    marks: '',
    group: 'block',
    code: true,
    defining: true,
    attrs: { language: { default: '' } },
    parseDOM: [
      {
        tag: 'pre',
        preserveWhitespace: 'full',
        getAttrs: (dom) => {
          const el = dom as HTMLElement
          const code = el.querySelector('code')
          return {
            language: code?.getAttribute('class')?.replace(/^language-/, '') || '',
          }
        },
      },
    ],
    toDOM: (node) => [
      'pre',
      node.attrs.language ? ['code', { class: 'language-' + node.attrs.language }, 0] : ['code', 0],
    ],
  },

  text: {
    group: 'inline',
  },

  image: {
    inline: true,
    attrs: {
      src: {},
      alt: { default: '' },
      title: { default: '' },
    },
    group: 'inline',
    draggable: true,
    parseDOM: [
      {
        tag: 'img[src]',
        getAttrs: (dom) => {
          const el = dom as HTMLImageElement
          return {
            src: el.getAttribute('src'),
            title: el.getAttribute('title'),
            alt: el.getAttribute('alt'),
          }
        },
      },
    ],
    toDOM: (node) => {
      const { src, alt, title } = node.attrs
      return ['img', { src, alt, title }]
    },
  },

  hard_break: {
    inline: true,
    group: 'inline',
    selectable: false,
    parseDOM: [{ tag: 'br' }],
    toDOM: () => ['br'],
  },

  ordered_list: {
    content: 'list_item+',
    group: 'block',
    attrs: { order: { default: 1 } },
    parseDOM: [
      {
        tag: 'ol',
        getAttrs: (dom) => ({
          order: (dom as HTMLElement).hasAttribute('start')
            ? parseInt((dom as HTMLElement).getAttribute('start') || '1', 10)
            : 1,
        }),
      },
    ],
    toDOM: (node) =>
      node.attrs.order === 1
        ? ['ol', 0]
        : ['ol', { start: node.attrs.order }, 0],
  },

  bullet_list: {
    content: 'list_item+',
    group: 'block',
    parseDOM: [{ tag: 'ul' }],
    toDOM: () => ['ul', 0],
  },

  list_item: {
    content: 'block+',
    defining: true,
    attrs: { checked: { default: null } },
    parseDOM: [
      {
        tag: 'li',
        getAttrs: (dom) => {
          const el = dom as HTMLElement
          const checkbox = el.querySelector('input[type="checkbox"]')
          if (checkbox) {
            return { checked: (checkbox as HTMLInputElement).checked }
          }
          return { checked: null }
        },
      },
    ],
    toDOM: (node) => {
      const { checked } = node.attrs
      if (checked !== null) {
        return [
          'li',
          ['input', { type: 'checkbox', checked: checked ? '' : undefined }],
          ['span', 0],
        ]
      }
      return ['li', 0]
    },
  },

  table: {
    content: 'table_row+',
    group: 'block',
    isolating: true,
    parseDOM: [{ tag: 'table' }],
    toDOM: () => ['table', ['tbody', 0]],
  },

  table_row: {
    content: '(table_cell | table_header)*',
    parseDOM: [{ tag: 'tr' }],
    toDOM: () => ['tr', 0],
  },

  table_cell: {
    content: 'inline*',
    attrs: { colspan: { default: 1 }, rowspan: { default: 1 } },
    parseDOM: [{ tag: 'td' }],
    toDOM: () => ['td', 0],
  },

  table_header: {
    content: 'inline*',
    attrs: { colspan: { default: 1 }, rowspan: { default: 1 } },
    parseDOM: [{ tag: 'th' }],
    toDOM: () => ['th', 0],
  },
}

const marks: Record<string, MarkSpec> = {
  link: {
    attrs: {
      href: {},
      title: { default: '' },
    },
    inclusive: false,
    parseDOM: [
      {
        tag: 'a[href]',
        getAttrs: (dom) => {
          const el = dom as HTMLAnchorElement
          return {
            href: el.getAttribute('href'),
            title: el.getAttribute('title'),
          }
        },
      },
    ],
    toDOM: (node) => ['a', { href: node.attrs.href, title: node.attrs.title }, 0],
  },

  em: {
    parseDOM: [{ tag: 'i' }, { tag: 'em' }],
    toDOM: () => ['em', 0],
  },

  strong: {
    parseDOM: [{ tag: 'strong' }, { tag: 'b' }],
    toDOM: () => ['strong', 0],
  },

  code: {
    parseDOM: [{ tag: 'code' }],
    toDOM: () => ['code', 0],
  },

  strike: {
    parseDOM: [{ tag: 's' }, { tag: 'del' }, { tag: 'strike' }],
    toDOM: () => ['s', 0],
  },
}

export const markdownSchema = new Schema({ nodes, marks })
