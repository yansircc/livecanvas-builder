/**
 * Advanced JSON Parser for LLM Responses
 *
 * This module provides a robust parser for extracting and parsing JSON from LLM responses,
 * which may contain markdown formatting, unescaped newlines, and other non-standard JSON.
 */

// Types for the parser
type TokenType =
  | 'STRING'
  | 'NUMBER'
  | 'BOOLEAN'
  | 'NULL'
  | 'OBJECT_START'
  | 'OBJECT_END'
  | 'ARRAY_START'
  | 'ARRAY_END'
  | 'COLON'
  | 'COMMA'
  | 'WHITESPACE'
  | 'UNKNOWN'

interface Token {
  type: TokenType
  value: string
  position: number
}

type ParserState =
  | 'NORMAL'
  | 'STRING'
  | 'ESCAPE'
  | 'COMMENT_SINGLE'
  | 'COMMENT_MULTI'
  | 'COMMENT_MULTI_END'

interface ParserContext {
  input: string
  position: number
  state: ParserState
  tokens: Token[]
  currentToken: string
  braceStack: string[]
}

/**
 * Main function to extract and parse JSON from a string
 * @param input The string that might contain JSON
 * @returns The parsed JSON object or null if parsing fails
 */
export function extractAndParseJSON<T>(input: string): T | null {
  if (!input || typeof input !== 'string') {
    return null
  }

  // Try direct parsing first
  try {
    return JSON.parse(input) as T
  } catch (_error) {
    console.log(`Direct JSON parsing failed, attempting advanced extraction...`)
  }

  // Extract from markdown if present
  const markdownExtracted = extractFromMarkdown(input)
  if (markdownExtracted) {
    try {
      return JSON.parse(markdownExtracted) as T
    } catch (_error) {
      console.log('Markdown extraction succeeded but parsing failed, continuing with other methods')
    }
  }

  // Preprocess the input
  const preprocessed = preprocessInput(input)

  // Try parsing the preprocessed input
  try {
    return JSON.parse(preprocessed) as T
  } catch (_error) {
    console.log('Preprocessed input parsing failed, continuing with tokenization')
  }

  // Tokenize the input
  const tokens = tokenize(preprocessed)

  // Extract balanced JSON
  const extracted = extractBalancedJSON(preprocessed, tokens)
  if (extracted) {
    try {
      return JSON.parse(extracted) as T
    } catch (_error) {
      console.log('Balanced JSON extraction failed, continuing with partial extraction')
    }
  }

  // Try partial extraction
  const partial = extractPartialJSON<T>(preprocessed)
  if (partial) {
    return partial
  }

  // Last resort: extract HTML
  const html = extractHTML(preprocessed)
  if (html) {
    return {
      code: html,
      advices: ['Extracted from HTML content'],
    } as unknown as T
  }

  return null
}

/**
 * Extract JSON from markdown code blocks
 */
function extractFromMarkdown(input: string): string | null {
  // Match code blocks with or without language specifier
  const codeBlockRegex = /```(?:json|javascript|js)?\s*([\s\S]*?)```/
  const match = codeBlockRegex.exec(input)

  if (match?.[1]) {
    const content = match[1].trim()

    // Preprocess the extracted content to handle newlines and other issues
    return preprocessInput(content)
  }

  return null
}

/**
 * Preprocess the input to fix common issues
 */
function preprocessInput(input: string): string {
  let result = input

  // Handle unescaped newlines in string literals
  result = result.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (match) => {
    return match.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')
  })

  // Fix unquoted property keys
  result = result.replace(/(\{|\,)\s*([a-zA-Z0-9_$]+)\s*:/g, '$1"$2":')

  // Fix single quotes to double quotes (but not inside double quotes)
  let inDoubleQuotes = false
  let fixedQuotes = ''

  for (let i = 0; i < result.length; i++) {
    const char = result[i]
    const prevChar = i > 0 ? result[i - 1] : ''

    if (char === '"' && prevChar !== '\\') {
      inDoubleQuotes = !inDoubleQuotes
      fixedQuotes += char
    } else if (char === "'" && !inDoubleQuotes && prevChar !== '\\') {
      fixedQuotes += '"'
    } else {
      fixedQuotes += char
    }
  }

  result = fixedQuotes

  // Fix missing commas between array elements
  result = result.replace(/(\]|\}|"[^"]*"|\d+|true|false|null)\s+(?=\{|\[|")/g, '$1,')

  // Fix trailing commas
  result = result.replace(/,(\s*[\]}])/g, '$1')

  return result
}

/**
 * Tokenize the input string
 */
function tokenize(input: string): Token[] {
  const context: ParserContext = {
    input,
    position: 0,
    state: 'NORMAL',
    tokens: [],
    currentToken: '',
    braceStack: [],
  }

  while (context.position < input.length) {
    const char = input[context.position] || ''

    switch (context.state) {
      case 'NORMAL':
        processNormalState(context, char)
        break
      case 'STRING':
        processStringState(context, char)
        break
      case 'ESCAPE':
        processEscapeState(context, char)
        break
      case 'COMMENT_SINGLE':
        processSingleCommentState(context, char)
        break
      case 'COMMENT_MULTI':
        processMultiCommentState(context, char)
        break
      case 'COMMENT_MULTI_END':
        processMultiCommentEndState(context, char)
        break
    }

    context.position++
  }

  // Add any remaining token
  if (context.currentToken) {
    addToken(context, determineTokenType(context.currentToken), context.currentToken)
  }

  return context.tokens
}

/**
 * Process character in NORMAL state
 */
function processNormalState(context: ParserContext, char: string): void {
  switch (char) {
    case '{':
      addToken(context, 'OBJECT_START', '{')
      context.braceStack.push('{')
      break
    case '}':
      addToken(context, 'OBJECT_END', '}')
      if (context.braceStack[context.braceStack.length - 1] === '{') {
        context.braceStack.pop()
      }
      break
    case '[':
      addToken(context, 'ARRAY_START', '[')
      context.braceStack.push('[')
      break
    case ']':
      addToken(context, 'ARRAY_END', ']')
      if (context.braceStack[context.braceStack.length - 1] === '[') {
        context.braceStack.pop()
      }
      break
    case ':':
      addToken(context, 'COLON', ':')
      break
    case ',':
      addToken(context, 'COMMA', ',')
      break
    case '"':
      addToken(context, 'STRING', '')
      context.state = 'STRING'
      break
    case "'":
      // Treat single quotes as double quotes
      addToken(context, 'STRING', '')
      context.state = 'STRING'
      break
    case '/':
      // Check for comments
      if (context.position + 1 < context.input.length) {
        const nextChar = context.input[context.position + 1]
        if (nextChar === '/') {
          context.state = 'COMMENT_SINGLE'
          context.position++ // Skip the next character
        } else if (nextChar === '*') {
          context.state = 'COMMENT_MULTI'
          context.position++ // Skip the next character
        } else {
          context.currentToken += char
        }
      } else {
        context.currentToken += char
      }
      break
    case ' ':
    case '\t':
    case '\n':
    case '\r':
      // Ignore whitespace between tokens
      if (context.currentToken) {
        addToken(context, determineTokenType(context.currentToken), context.currentToken)
        context.currentToken = ''
      }
      break
    default:
      context.currentToken += char
      break
  }
}

/**
 * Process character in STRING state
 */
function processStringState(context: ParserContext, char: string): void {
  const lastToken = context.tokens[context.tokens.length - 1] || { value: '' }

  if (char === '\\') {
    context.state = 'ESCAPE'
    lastToken.value += char
  } else if (char === '"' || char === "'") {
    lastToken.value += char
    context.state = 'NORMAL'
  } else {
    lastToken.value += char
  }
}

/**
 * Process character in ESCAPE state
 */
function processEscapeState(context: ParserContext, char: string): void {
  const lastToken = context.tokens[context.tokens.length - 1] || { value: '' }
  lastToken.value += char
  context.state = 'STRING'
}

/**
 * Process character in COMMENT_SINGLE state
 */
function processSingleCommentState(context: ParserContext, char: string): void {
  if (char === '\n') {
    context.state = 'NORMAL'
  }
}

/**
 * Process character in COMMENT_MULTI state
 */
function processMultiCommentState(context: ParserContext, char: string): void {
  if (char === '*') {
    context.state = 'COMMENT_MULTI_END'
  }
}

/**
 * Process character in COMMENT_MULTI_END state
 */
function processMultiCommentEndState(context: ParserContext, char: string): void {
  if (char === '/') {
    context.state = 'NORMAL'
  } else if (char !== '*') {
    context.state = 'COMMENT_MULTI'
  }
}

/**
 * Add a token to the token list
 */
function addToken(context: ParserContext, type: TokenType, value: string): void {
  if (type !== 'WHITESPACE') {
    context.tokens.push({
      type,
      value,
      position: context.position,
    })
  }
  context.currentToken = ''
}

/**
 * Determine the type of a token based on its value
 */
function determineTokenType(value: string): TokenType {
  if (value === '') return 'WHITESPACE'

  // Check for numbers
  if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(value)) {
    return 'NUMBER'
  }

  // Check for booleans and null
  if (value === 'true' || value === 'false') {
    return 'BOOLEAN'
  }

  if (value === 'null') {
    return 'NULL'
  }

  return 'UNKNOWN'
}

/**
 * Extract balanced JSON from the input
 */
function extractBalancedJSON(input: string, tokens: Token[]): string | null {
  // Find the first object or array start
  const startToken = tokens.find(
    (token) => token.type === 'OBJECT_START' || token.type === 'ARRAY_START',
  )

  if (!startToken) return null

  const startType = startToken.type
  const endType = startType === 'OBJECT_START' ? 'OBJECT_END' : 'ARRAY_END'
  const startPos = startToken.position
  let depth = 1
  let endPos = -1

  // Find the matching end token
  for (let i = tokens.indexOf(startToken) + 1; i < tokens.length; i++) {
    const token = tokens[i] || { type: 'UNKNOWN', value: '', position: 0 }

    if (token.type === startType) {
      depth++
    } else if (token.type === endType) {
      depth--
      if (depth === 0) {
        endPos = token.position + 1
        break
      }
    }
  }

  if (endPos > startPos) {
    return input.substring(startPos, endPos)
  }

  return null
}

/**
 * Extract partial JSON when complete parsing fails
 */
function extractPartialJSON<T>(input: string): T | null {
  // Look for code and advices patterns
  const codeMatch =
    /"code"[\s:]+["']?([^"']*?)["']?(?=[,}]|$)/.exec(input) ||
    /code[\s:]+["']?([^"']*?)["']?(?=[,}]|$)/.exec(input)

  const advicesMatch =
    /"advices?"[\s:]+\[(.*?)\]/.exec(input) || /advices?[\s:]+\[(.*?)\]/.exec(input)

  if (codeMatch) {
    const minimalObject: any = {
      code: codeMatch[1] || '<!-- Failed to extract valid HTML -->',
      advices: [],
    }

    if (advicesMatch?.[1]) {
      try {
        // Try to parse advices as an array
        const advicesStr = `[${advicesMatch[1]}]`.replace(/'/g, '"').replace(/(\w+):/g, '"$1":')

        const advices = JSON.parse(advicesStr)
        minimalObject.advices = Array.isArray(advices) ? advices : []
      } catch (_error) {
        // Extract individual advice strings
        const adviceMatches = advicesMatch[1].match(/["']([^"']*?)["']|(\w+)/g)
        if (adviceMatches) {
          minimalObject.advices = adviceMatches.map((a) => a.replace(/^["']|["']$/g, ''))
        }
      }
    }

    return minimalObject as T
  }

  return null
}

/**
 * Extract HTML content as a last resort
 */
function extractHTML(input: string): string | null {
  // Look for HTML tags
  const htmlRegex = /<([a-z][a-z0-9]*)\b[^>]*>([\s\S]*?)<\/\1>/gi
  const matches = Array.from(input.matchAll(htmlRegex))
  const largestMatch = matches.reduce((max, current) => {
    if (!max) return current
    const currentLength = current[0].length
    const maxLength = max[0]?.length || 0
    return currentLength > maxLength ? current : max
  }, matches[0])

  if (largestMatch) {
    return largestMatch[0]
  }

  // Try to find any HTML-like content
  const tagRegex = /<[a-z][a-z0-9]*\b[^>]*>/i
  const tagMatch = tagRegex.exec(input)

  if (tagMatch) {
    // Extract from the first tag to the end of input
    return input.substring(tagMatch.index)
  }

  return null
}
