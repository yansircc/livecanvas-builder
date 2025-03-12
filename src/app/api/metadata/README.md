# Metadata Generation API

This API endpoint automatically generates metadata (title, description, and tags) for HTML content. It uses GPT-4o Mini to analyze the HTML and produce appropriate metadata for publishing in a gallery.

## Endpoint

```
POST /api/metadata
```

## Request Body

| Parameter   | Type    | Required | Description                                                 |
| ----------- | ------- | -------- | ----------------------------------------------------------- |
| htmlContent | string  | Yes      | The HTML content to analyze                                 |
| regenerate  | boolean | No       | Whether to regenerate metadata with a different perspective |

## Response

The response is a JSON object with the following structure:

```json
{
  "title": "Generated title for the HTML content",
  "description": "Generated description explaining the HTML content",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}
```

## Example Usage

```typescript
// Example request
const response = await fetch('/api/metadata', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    htmlContent: '<your-html-content>',
    regenerate: false, // Optional, set to true to get alternative metadata
  }),
})

const data = await response.json()
console.log(data)
```

## Error Handling

The API returns appropriate error messages with status codes:

- `400 Bad Request`: Missing or invalid HTML content
- `500 Internal Server Error`: Issues with the AI model or processing

## Testing

You can test the API using the provided test script:

```bash
bun src/app/api/metadata/test.ts
```

This script tests both the initial metadata generation and regeneration functionality.

## Implementation Details

- Uses GPT-4o Mini for efficient and cost-effective metadata generation
- Implements a fallback mechanism for robust operation
- Validates output against a schema to ensure quality
- Supports regeneration for alternative perspectives
