import { describe, it, expect } from 'vitest'
import { countWords, countChars } from './wordCount'

describe('countWords', () => {
  it('counts words in English', () => {
    expect(countWords('Hello world')).toBe(2)
  })

  it('counts words in Chinese mixed text', () => {
    expect(countWords('你好 世界 foo')).toBe(3)
  })

  it('handles multiple spaces and newlines', () => {
    expect(countWords('Hello   world\nfoo')).toBe(3)
  })

  it('returns 0 for empty string', () => {
    expect(countWords('')).toBe(0)
  })

  it('returns 0 for whitespace only', () => {
    expect(countWords('   \n\t  ')).toBe(0)
  })
})

describe('countChars', () => {
  it('counts characters excluding whitespace', () => {
    expect(countChars('Hello world')).toBe(10)
  })

  it('returns 0 for empty string', () => {
    expect(countChars('')).toBe(0)
  })
})
