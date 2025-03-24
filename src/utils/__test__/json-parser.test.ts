import { describe, expect, it } from "bun:test";
import { extractAndParseJSON } from "../json-parser";

interface TestObject {
	code: string;
	advices: string[];
}

describe("Refactored JSON Parser Tests", () => {
	// Test for unescaped newlines in string literals
	it("should handle unescaped newlines in string literals", () => {
		const jsonWithNewlines = `{
      "code": "<div>
        <h1>Title</h1>
        <p>Paragraph with
        multiple
        lines</p>
      </div>",
      "advices": ["First advice", "Second advice"]
    }`;

		const result = extractAndParseJSON<TestObject>(jsonWithNewlines);

		expect(result).not.toBeNull();
		expect(result?.code).toContain("<div>");
		expect(result?.code).toContain("<h1>Title</h1>");
		expect(result?.advices).toHaveLength(2);
	});

	// Test for nested HTML with attributes and complex structure
	it("should handle complex HTML with attributes and nested structure", () => {
		const complexHtml = `{
      "code": "<section class=\\"container\\" data-aos=\\"fade-up\\">
        <div class=\\"row align-items-center\\">
          <div class=\\"col-md-6\\">
            <h2 class=\\"display-4 mb-4\\">Product Features</h2>
            <p class=\\"lead\\">Our product offers the following features:</p>
            <ul class=\\"list-unstyled\\">
              <li><i class=\\"lucide-check text-success mr-2\\"></i> Feature 1</li>
              <li><i class=\\"lucide-check text-success mr-2\\"></i> Feature 2</li>
              <li><i class=\\"lucide-check text-success mr-2\\"></i> Feature 3</li>
            </ul>
            <button class=\\"btn btn-primary mt-3\\">Learn More</button>
          </div>
          <div class=\\"col-md-6\\">
            <img src=\\"https://example.com/image.jpg\\" alt=\\"Product\\" class=\\"img-fluid rounded shadow\\">
          </div>
        </div>
      </section>",
      "advices": [
        "Use semantic HTML elements for better accessibility",
        "Consider adding more whitespace between elements",
        "Make sure images have appropriate alt text"
      ]
    }`;

		const result = extractAndParseJSON<TestObject>(complexHtml);

		expect(result).not.toBeNull();
		expect(result?.code).toContain('<section class="container"');
		expect(result?.code).toContain('<button class="btn btn-primary mt-3">');
		expect(result?.advices).toHaveLength(3);
	});

	// Test for malformed JSON with mixed quote styles and missing commas
	it("should handle malformed JSON with mixed quote styles and missing commas", () => {
		const malformedJson = `{
      "code": '<div class="container">
        <h1>Mixed Quotes</h1>
        <p>This has "nested" quotes</p>
      </div>'
      advices: [
        'Missing comma after code'
        "Mixed quote styles"
        'Missing comma here too'
      ]
    }`;

		const result = extractAndParseJSON<TestObject>(malformedJson);

		expect(result).not.toBeNull();
		expect(result?.code).toContain('<div class="container">');
		expect(result?.advices.length).toBeGreaterThan(0);
	});

	// Test for JSON embedded in markdown with surrounding text
	it("should extract JSON from markdown with surrounding text", () => {
		const markdownWithJson = `
    # Response to your request
    
    Here's the HTML component you requested:
    
    \`\`\`json
    {
      "code": "<div class=\\"card\\">
        <div class=\\"card-header\\">
          <h3>Card Title</h3>
        </div>
        <div class=\\"card-body\\">
          <p>Card content goes here</p>
        </div>
        <div class=\\"card-footer\\">
          <button class=\\"btn\\">Click Me</button>
        </div>
      </div>",
      "advices": [
        "Consider adding more padding",
        "Use a more descriptive button text"
      ]
    }
    \`\`\`
    
    Let me know if you need any adjustments to the code above.
    `;

		const result = extractAndParseJSON<TestObject>(markdownWithJson);

		expect(result).not.toBeNull();
		expect(result?.code).toContain('<div class="card">');
		expect(result?.advices).toHaveLength(2);
	});

	// Test for extremely malformed but recoverable JSON
	it("should recover from extremely malformed JSON", () => {
		const extremelyMalformedJson = `
    {
      code: <div>
        <h1>This is not even in quotes</h1>
        <p>And has unescaped < and > characters</p>
      </div>
      
      advices: [
        This isn't in quotes either
        Neither is this
        "But this one is"
      ]
    }
    `;

		const result = extractAndParseJSON<TestObject>(extremelyMalformedJson);

		// We just expect some kind of result, not necessarily perfect
		expect(result).not.toBeNull();
		expect(result?.code).toBeDefined();
	});

	// Test for JSON with Unicode characters and emojis
	it("should handle JSON with Unicode characters and emojis", () => {
		const unicodeJson = `{
      "code": "<div>
        <h1>你好，世界！</h1>
        <p>This contains emojis: 🚀 🔥 👍</p>
        <p>And special characters: ©®™</p>
      </div>",
      "advices": ["Unicode advice: 这是一个建议", "Emoji advice: 👍 works well"]
    }`;

		const result = extractAndParseJSON<TestObject>(unicodeJson);

		expect(result).not.toBeNull();
		expect(result?.code).toContain("你好，世界！");
		expect(result?.code).toContain("🚀 🔥 👍");
		expect(result?.advices[0]).toContain("这是一个建议");
	});

	// Test for JSON with deeply nested structures
	it("should handle deeply nested JSON structures", () => {
		const deeplyNestedJson = `{
      "code": "<div class=\\"outer\\">
        <div class=\\"level-1\\">
          <div class=\\"level-2\\">
            <div class=\\"level-3\\">
              <div class=\\"level-4\\">
                <div class=\\"level-5\\">
                  <p>Deeply nested content</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>",
      "advices": [
        "Consider flattening your HTML structure",
        "Too many nested divs can impact performance",
        "Use semantic elements instead of generic divs"
      ]
    }`;

		const result = extractAndParseJSON<TestObject>(deeplyNestedJson);

		expect(result).not.toBeNull();
		expect(result?.code).toContain("level-5");
		expect(result?.code).toContain("Deeply nested content");
		expect(result?.advices).toHaveLength(3);
	});

	// Test for JSON with JavaScript code snippets inside
	it("should handle JSON with JavaScript code snippets inside", () => {
		const jsonWithJavaScript = `{
      "code": "<script>
        function handleClick() {
          const x = document.getElementById('demo');
          if (x.style.display === 'none') {
            x.style.display = 'block';
          } else {
            x.style.display = 'none';
          }
          // This is a comment
          /* This is a 
             multi-line comment */
          return false;
        }
      </script>
      <button onclick=\\"handleClick()\\">Toggle</button>
      <div id=\\"demo\\">This is a demo</div>",
      "advices": [
        "Avoid inline JavaScript for better separation of concerns",
        "Consider using addEventListener instead of onclick attribute"
      ]
    }`;

		const result = extractAndParseJSON<TestObject>(jsonWithJavaScript);

		expect(result).not.toBeNull();
		expect(result?.code).toContain("function handleClick()");
		expect(result?.code).toContain("document.getElementById");
		expect(result?.advices).toHaveLength(2);
	});

	// Test for partial JSON extraction
	it("should extract partial JSON when complete parsing fails", () => {
		const partialJson = `
    Here's what you need:
    
    code: "<div>Just the code part</div>"
    
    And some advices:
    
    advices: ["Just the advice part"]
    
    Hope this helps!
    `;

		const result = extractAndParseJSON<TestObject>(partialJson);

		expect(result).not.toBeNull();
		// We're just checking if it extracted something reasonable
		expect(result?.code).toBeDefined();
		expect(result?.code).toContain("<div>");
	});

	// Test for HTML extraction as last resort
	it("should extract HTML as last resort when JSON parsing fails completely", () => {
		const htmlOnly = `
    <div class="container">
      <h1>This is just HTML</h1>
      <p>No JSON structure around it</p>
    </div>
    `;

		const result = extractAndParseJSON<TestObject>(htmlOnly);

		expect(result).not.toBeNull();
		expect(result?.code).toContain('<div class="container">');
		expect(result?.advices).toBeDefined();
	});
});
