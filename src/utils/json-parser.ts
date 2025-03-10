/**
 * Utility functions for parsing JSON from LLM responses
 */

/**
 * Extracts and parses JSON from a string that might contain markdown formatting or other non-JSON content
 * @param input The string that might contain JSON
 * @returns The parsed JSON object or null if parsing fails
 */
export function extractAndParseJSON<T>(input: string): T | null {
  if (!input || typeof input !== 'string') {
    return null
  }

  // Try parsing the input directly first
  try {
    return JSON.parse(input) as T
  } catch (_error) {
    // If direct parsing fails, try to extract JSON
    console.log('Direct JSON parsing failed, attempting to extract JSON from the response')
  }

  // Remove markdown code block markers
  let cleanedInput = input

  // Handle markdown code blocks (```json ... ```)
  const codeBlockRegex = /```(?:json|javascript|js)?\s*([\s\S]*?)```/
  const codeBlockMatch = codeBlockRegex.exec(input)
  if (codeBlockMatch?.[1]) {
    cleanedInput = codeBlockMatch[1].trim()

    // Try parsing the code block content
    try {
      return JSON.parse(cleanedInput) as T
    } catch (_error) {
      // Continue with other extraction methods
      console.log('Code block extraction failed, continuing with other methods')
    }
  }

  // Remove JavaScript-style comments
  cleanedInput = cleanedInput
    .replace(/\/\/.*$/gm, '') // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments

  // Try to find JSON object pattern {...}
  const jsonObjectRegex = /(\{[\s\S]*?\})/g
  const jsonMatches = Array.from(cleanedInput.matchAll(jsonObjectRegex))

  // Try each match until we find a valid JSON
  for (const match of jsonMatches) {
    const potentialJson = match[0]
    try {
      return JSON.parse(potentialJson) as T
    } catch (_error) {
      // Try the next match
      continue
    }
  }

  // If no valid JSON found, try fixing common issues

  // 1. Try with the first {...} pattern found
  const simpleJsonMatch = /\{[\s\S]*?\}/.exec(cleanedInput)
  if (simpleJsonMatch) {
    const potentialJson = simpleJsonMatch[0]

    // 2. Fix single quotes
    const fixedQuotes = potentialJson.replace(/'/g, '"')

    // 3. Fix unquoted keys - more comprehensive regex that handles various key formats
    const fixedKeys = fixedQuotes.replace(/(\b[a-zA-Z_$][\w$]*(?:-[\w$]+)*)(?=\s*:)/g, '"$1"')

    // 4. Fix trailing commas
    const fixedCommas = fixedKeys.replace(/,\s*([}\]])/g, '$1')

    // 5. Add missing commas between elements
    const fixedMissingCommas = fixedCommas.replace(/("[^"]*")\s*(?=\s*")/g, '$1,')

    try {
      return JSON.parse(fixedMissingCommas) as T
    } catch (_error) {
      console.error('Failed to parse JSON after fixing common issues:', _error)
    }
  }

  // Last resort: try to extract any JSON-like structure with more aggressive fixes
  try {
    // Look for patterns that might be JSON objects
    const jsonLikeRegex = /\{[^{]*?\}/g
    const jsonLikeMatches = Array.from(cleanedInput.matchAll(jsonLikeRegex))

    for (const match of jsonLikeMatches) {
      const potentialJson = match[0]

      // Apply all fixes at once
      const fixed = potentialJson
        .replace(/'/g, '"') // Replace single quotes with double quotes
        .replace(/(\b[a-zA-Z_$][\w$]*(?:-[\w$]+)*)(?=\s*:)/g, '"$1"') // Quote unquoted keys
        .replace(/,\s*([}\]])/g, '$1') // Remove trailing commas
        .replace(/\\/g, '\\\\') // Escape backslashes
        .replace(/`/g, "'") // Replace backticks with single quotes
        .replace(/\n/g, '\\n') // Escape newlines
        .replace(/\t/g, '\\t') // Escape tabs
        .replace(/:\s*"([^"]*?)"/g, (match, p1) => {
          // Fix nested quotes in values
          return ': "' + p1.replace(/"/g, '\\"') + '"'
        })
        // Add missing commas between elements
        .replace(/("[^"]*")\s*(?=\s*")/g, '$1,')
        // Add missing commas between array elements
        .replace(/(\[[^\]]*?)(["'][^"']*?["'])\s+(["'][^"']*?["'])/g, '$1$2,$3')

      // First attempt: direct parsing
      try {
        const result = JSON.parse(fixed) as T
        return result
      } catch (_error) {
        // Continue to next approach
      }

      // Second attempt: sanitize non-JSON characters
      try {
        const sanitized = fixed.replace(/("[^"]*")|[^\s{}[\],:"\d\w.-]/g, (match, p1) => {
          return p1 || '' // Keep string content, remove other non-JSON chars
        })

        // Add missing commas between properties
        const withCommas = sanitized
          .replace(/}(\s*){/g, '},\n$1{')
          .replace(/"([^"]*?)"\s*"([^"]*?)"/g, '"$1",\n"$2"')

        const result = JSON.parse(withCommas) as T
        return result
      } catch (_error) {
        // Continue to next match
      }
    }
  } catch (_error) {
    console.error('All JSON extraction attempts failed:', _error)
  }

  // If all else fails, try to construct a minimal valid object with the expected structure
  try {
    // Look for code and advices patterns separately
    const codeMatch = /"code"[\s:]+["']([^"']*?)["']/.exec(cleanedInput)
    const advicesMatch = /"advices"[\s:]+\[(.*?)\]/.exec(cleanedInput)

    if (codeMatch) {
      const minimalObject: any = {
        code: codeMatch[1] || '<!-- Failed to extract valid HTML -->',
        advices: [],
      }

      if (advicesMatch?.[1]) {
        // Try to extract advices as an array
        const advicesStr = `[${advicesMatch[1]}]`
        try {
          const advices = JSON.parse(advicesStr)
          minimalObject.advices = Array.isArray(advices) ? advices : []
        } catch (_error) {
          // If parsing fails, try to extract individual advice strings
          const adviceMatches = advicesMatch[1].match(/["']([^"']*?)["']/g)
          if (adviceMatches) {
            minimalObject.advices = adviceMatches.map((a) => a.replace(/["']/g, ''))
          }
        }
      }

      return minimalObject as T
    }

    // Try even more aggressive pattern matching for partial extraction
    const codePattern = /code['":\s]+['"<]([^'"]*?)['">\n]/
    const altCodeMatch = codePattern.exec(cleanedInput)

    if (altCodeMatch) {
      const minimalObject: any = {
        code: `<div>${altCodeMatch[1]}</div>`,
        advices: [],
      }

      // Look for anything that might be advice
      const advicePattern = /advices?['":\s]+\[([^\]]*?)\]/
      const altAdvicesMatch = advicePattern.exec(cleanedInput)

      if (altAdvicesMatch) {
        const adviceStrings = altAdvicesMatch[1]!
          .split(/[,\n]/)
          .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
          .filter((s) => s.length > 0)

        minimalObject.advices = adviceStrings
      }

      return minimalObject as T
    }
  } catch (_error) {
    console.error('Failed to construct minimal valid object:', _error)
  }

  return null
}
