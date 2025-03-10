import { describe, expect, it } from 'bun:test'
import { extractAndParseJSON } from '../json-parser'

interface TestObject {
  code: string
  advices: string[]
}

describe('extractAndParseJSON', () => {
  // Valid JSON cases
  it('should parse valid JSON correctly', () => {
    const validJson = '{"code": "<div>Test</div>", "advices": ["Advice 1", "Advice 2"]}'
    const result = extractAndParseJSON<TestObject>(validJson)

    expect(result).not.toBeNull()
    expect(result?.code).toBe('<div>Test</div>')
    expect(result?.advices).toEqual(['Advice 1', 'Advice 2'])
  })

  // Markdown code block cases
  it('should extract JSON from markdown code blocks with json tag', () => {
    const markdownJson =
      '```json\n{"code": "<div>Test</div>", "advices": ["Advice 1", "Advice 2"]}\n```'
    const result = extractAndParseJSON<TestObject>(markdownJson)

    expect(result).not.toBeNull()
    expect(result?.code).toBe('<div>Test</div>')
    expect(result?.advices).toEqual(['Advice 1', 'Advice 2'])
  })

  it('should extract JSON from markdown code blocks without language tag', () => {
    const markdownJson =
      '```\n{"code": "<div>Test</div>", "advices": ["Advice 1", "Advice 2"]}\n```'
    const result = extractAndParseJSON<TestObject>(markdownJson)

    expect(result).not.toBeNull()
    expect(result?.code).toBe('<div>Test</div>')
    expect(result?.advices).toEqual(['Advice 1', 'Advice 2'])
  })

  it('should extract JSON from markdown code blocks with javascript tag', () => {
    const markdownJson =
      '```javascript\n{"code": "<div>Test</div>", "advices": ["Advice 1", "Advice 2"]}\n```'
    const result = extractAndParseJSON<TestObject>(markdownJson)

    expect(result).not.toBeNull()
    expect(result?.code).toBe('<div>Test</div>')
    expect(result?.advices).toEqual(['Advice 1', 'Advice 2'])
  })

  // JSON with surrounding text
  it('should extract JSON from text with surrounding content', () => {
    const textWithJson =
      'Here is the response:\n{"code": "<div>Test</div>", "advices": ["Advice 1", "Advice 2"]}\nHope this helps!'
    const result = extractAndParseJSON<TestObject>(textWithJson)

    expect(result).not.toBeNull()
    expect(result?.code).toBe('<div>Test</div>')
    expect(result?.advices).toEqual(['Advice 1', 'Advice 2'])
  })

  // Nested markdown and text
  it('should extract JSON from nested markdown and text', () => {
    const nestedMarkdown =
      'I recommend using this HTML:\n\n```json\n{"code": "<div>Test</div>", "advices": ["Advice 1", "Advice 2"]}\n```\n\nLet me know if you need anything else.'
    const result = extractAndParseJSON<TestObject>(nestedMarkdown)

    expect(result).not.toBeNull()
    expect(result?.code).toBe('<div>Test</div>')
    expect(result?.advices).toEqual(['Advice 1', 'Advice 2'])
  })

  // JSON with formatting issues
  it('should handle JSON with single quotes instead of double quotes', () => {
    const singleQuotesJson = "{'code': '<div>Test</div>', 'advices': ['Advice 1', 'Advice 2']}"
    const result = extractAndParseJSON<TestObject>(singleQuotesJson)

    expect(result).not.toBeNull()
    expect(result?.code).toBe('<div>Test</div>')
    expect(result?.advices).toEqual(['Advice 1', 'Advice 2'])
  })

  it('should handle JSON with unquoted keys', () => {
    const unquotedKeysJson = "{code: '<div>Test</div>', advices: ['Advice 1', 'Advice 2']}"
    const result = extractAndParseJSON<TestObject>(unquotedKeysJson)

    expect(result).not.toBeNull()
    expect(result?.code).toBe('<div>Test</div>')
    expect(result?.advices).toEqual(['Advice 1', 'Advice 2'])
  })

  // Complex nested structures
  it('should handle complex nested JSON structures', () => {
    const complexJson = `
    \`\`\`json
    {
      "code": "<div class=\\"container\\">\\n  <h1>Hello World</h1>\\n  <p>This is a test</p>\\n</div>",
      "advices": [
        "Add more semantic HTML elements",
        "Consider using CSS Grid for layout",
        "Improve accessibility with ARIA attributes"
      ]
    }
    \`\`\`
    `

    const result = extractAndParseJSON<TestObject>(complexJson)

    expect(result).not.toBeNull()
    expect(result?.code).toContain('<div class="container">')
    expect(result?.advices).toHaveLength(3)
    expect(result?.advices[0]).toBe('Add more semantic HTML elements')
  })

  // Malformed JSON that should still be parsed
  it('should handle JSON with trailing commas', () => {
    const trailingCommaJson = '{"code": "<div>Test</div>", "advices": ["Advice 1", "Advice 2",]}'
    const result = extractAndParseJSON<TestObject>(trailingCommaJson)

    // This test might fail with standard JSON.parse, but our function should handle it
    expect(result).not.toBeNull()
  })

  // Edge cases
  it('should return null for empty input', () => {
    expect(extractAndParseJSON('')).toBeNull()
  })

  it('should return null for non-string input', () => {
    // @ts-expect-error Testing invalid input type
    expect(extractAndParseJSON(null)).toBeNull()
    // @ts-expect-error Testing invalid input type
    expect(extractAndParseJSON(undefined)).toBeNull()
    // @ts-expect-error Testing invalid input type
    expect(extractAndParseJSON(123)).toBeNull()
  })

  it('should return null for completely invalid JSON', () => {
    const invalidJson = 'This is not JSON at all'
    expect(extractAndParseJSON(invalidJson)).toBeNull()
  })

  // Real-world LLM response examples
  it('should handle real-world LLM response with markdown', () => {
    const llmResponse = `
    I've created a simple HTML button with Bootstrap styling and AOS animation:

    \`\`\`json
    {
      "code": "<section class=\\"container py-5\\">\\n  <div class=\\"d-flex justify-content-center\\">\\n    <button class=\\"btn btn-primary\\" data-aos=\\"fade-up\\" data-aos-duration=\\"1000\\">\\n      <i class=\\"lucide-check\\" style=\\"font-size: 0.8em;\\"></i> 立即咨询\\n    </button>\\n  </div>\\n</section>",
      "advices": [
        "使用Bootstrap的\`btn\`类确保按钮样式一致且响应式。",
        "添加AOS动画\`fade-up\`提升按钮的视觉吸引力。",
        "通过\`d-flex\`和\`justify-content-center\`确保按钮在页面中居中显示。"
      ]
    }
    \`\`\`

    This button has the following features:
    1. Centered in the container using Bootstrap's flexbox utilities
    2. Primary button styling from Bootstrap
    3. Fade-up animation using AOS library
    4. A small check icon from Lucide icons
    5. Chinese text that says "Consult Now"
    `

    const result = extractAndParseJSON<TestObject>(llmResponse)

    expect(result).not.toBeNull()
    expect(result?.code).toContain('<section class="container py-5">')
    expect(result?.advices).toHaveLength(3)
  })

  it('should handle LLM response with escaped quotes and special characters', () => {
    const escapedResponse = `
    \`\`\`json
    {
      "code": "<div class=\\"container\\">\\n  <p>This has \\"quoted\\" text and special chars like \\\\, \\n, and \\t</p>\\n</div>",
      "advices": [
        "Advice with \\"quotes\\"",
        "Advice with \\\\backslashes\\\\",
        "Advice with \\nnewlines"
      ]
    }
    \`\`\`
    `

    const result = extractAndParseJSON<TestObject>(escapedResponse)

    expect(result).not.toBeNull()
    expect(result?.code).toContain('This has "quoted" text')
    expect(result?.advices[0]).toContain('"quotes"')
  })

  // Multiple JSON objects in the same string
  it('should extract the first valid JSON object when multiple are present', () => {
    const multipleJson = `
    First object:
    {"code": "<div>First</div>", "advices": ["First Advice"]}
    
    Second object:
    {"code": "<div>Second</div>", "advices": ["Second Advice"]}
    `

    const result = extractAndParseJSON<TestObject>(multipleJson)

    expect(result).not.toBeNull()
    expect(result?.code).toBe('<div>First</div>')
  })

  // Additional edge cases
  it('should handle JSON with nested quotes in values', () => {
    const nestedQuotesJson =
      '{"code": "<div class=\\"container\\">Test</div>", "advices": ["Use \\"quotes\\" properly"]}'
    const result = extractAndParseJSON<TestObject>(nestedQuotesJson)

    expect(result).not.toBeNull()
    expect(result?.code).toBe('<div class="container">Test</div>')
    expect(result?.advices[0]).toBe('Use "quotes" properly')
  })

  it('should handle JSON with JavaScript-style comments', () => {
    const jsonWithComments = `
    {
      // This is a comment
      "code": "<div>Test</div>", /* Another comment */
      "advices": ["Advice 1", "Advice 2"]
    }
    `

    const result = extractAndParseJSON<TestObject>(jsonWithComments)

    expect(result).not.toBeNull()
    expect(result?.code).toBe('<div>Test</div>')
  })

  it('should handle partial JSON extraction when full parsing fails', () => {
    const partialJson = `
    The code is:
    "code": "<div>Partial</div>",
    and the advices are:
    "advices": ["Partial Advice 1", "Partial Advice 2"]
    `

    const result = extractAndParseJSON<TestObject>(partialJson)

    expect(result).not.toBeNull()
    expect(result?.code).toBe('<div>Partial</div>')
    expect(result?.advices).toContainEqual('Partial Advice 1')
  })

  it('should handle JSON with Unicode characters', () => {
    const unicodeJson =
      '{"code": "<div>Unicode: \\u00A9 \\u2713 \\u2665</div>", "advices": ["Unicode: 你好，世界"]}'
    const result = extractAndParseJSON<TestObject>(unicodeJson)

    expect(result).not.toBeNull()
    expect(result?.code).toContain('Unicode:')
    expect(result?.advices[0]).toContain('你好，世界')
  })

  it('should handle JSON with special characters in keys', () => {
    const specialKeysJson =
      '{"code-html": "<div>Test</div>", "advices_list": ["Advice 1", "Advice 2"]}'

    // We need to use any here since our interface doesn't match the keys
    const result = extractAndParseJSON<any>(specialKeysJson)

    expect(result).not.toBeNull()
    expect(result?.['code-html']).toBe('<div>Test</div>')
    expect(result?.advices_list).toEqual(['Advice 1', 'Advice 2'])
  })

  it('should handle extremely malformed but recoverable JSON', () => {
    const malformedJson = `
    {
      code: '<div>Malformed</div>'
      advices: [
        'Missing commas'
        'Unquoted keys'
        'Single quotes'
      ]
    }
    `

    const result = extractAndParseJSON<TestObject>(malformedJson)

    expect(result).not.toBeNull()
    expect(result?.code).toContain('<div>Malformed</div>')
    // We don't test exact advices content as the parsing might vary
    expect(result?.advices).toBeDefined()
  })
})
