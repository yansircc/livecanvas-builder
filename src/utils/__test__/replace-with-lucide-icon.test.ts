import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { getIconSvg } from "../get-icon-svg";
import { replaceLucideIcons } from "../replace-with-lucide-icon";

// 创建一个 mock 函数
const mockIconSvg = mock(() => "<svg>MockedSvg</svg>");

// 在所有测试运行前先备份原始函数
const originalGetIconSvg = getIconSvg;

describe("replaceLucideIcons", () => {
	// 每个测试前重置所有 mock
	beforeEach(() => {
		// 重写 getIconSvg 模块的导出
		mock.module("../get-icon-svg", () => ({
			getIconSvg: mockIconSvg,
		}));
	});

	// 测试后恢复所有 mock
	afterEach(() => {
		mock.restore();
	});

	it("should replace simple lucide icon", () => {
		const input = '<i class="lucide-home"></i>';
		const result = replaceLucideIcons(input);
		expect(result).toMatch(/<span class=""><svg>MockedSvg<\/svg><\/span>/);
	});

	it("should preserve other classes", () => {
		const input = '<i class="lucide-home custom-class"></i>';
		const result = replaceLucideIcons(input);
		expect(result).toMatch(
			/<span class="custom-class"><svg>MockedSvg<\/svg><\/span>/,
		);
	});

	it("should preserve other attributes", () => {
		const input = '<i class="lucide-home" style="color: red;"></i>';
		const result = replaceLucideIcons(input);
		expect(result).toMatch(
			/<span class="" style="color: red;"><svg>MockedSvg<\/svg><\/span>/,
		);
	});

	it("should handle escaped quotes", () => {
		const input = '<i class=\\"lucide-home\\"></i>';
		const result = replaceLucideIcons(input);
		expect(result).toMatch(/<span class=\\"\\"><svg>MockedSvg<\/svg><\/span>/);
	});

	it("should handle multiple icons", () => {
		const input = `
      <div>
        <i class="lucide-home"></i>
        <i class="lucide-settings"></i>
      </div>
    `;
		const result = replaceLucideIcons(input);
		expect(result).toMatch(/<span class=""><svg>MockedSvg<\/svg><\/span>/);
		expect(result.match(/<svg>MockedSvg<\/svg>/g)?.length).toBe(2);
	});

	it("should handle non-lucide icons", () => {
		const input = '<i class="fa fa-home"></i>';
		const result = replaceLucideIcons(input);
		expect(result).toBe(input);
	});

	it("should handle empty input", () => {
		const input = "";
		const result = replaceLucideIcons(input);
		expect(result).toBe("");
	});

	it("should handle invalid lucide icon", () => {
		// 临时修改 mock 实现为返回 null
		mockIconSvg.mockImplementation(() => "");

		const input = '<i class="lucide-invalid-icon"></i>';
		const result = replaceLucideIcons(input);

		expect(result).toBe(input);

		// 恢复 mock 实现
		mockIconSvg.mockImplementation(() => "<svg>MockedSvg</svg>");
	});

	it("should handle complex HTML structure", () => {
		const input = `
      <div class="container">
        <p>Some text</p>
        <i class="lucide-home"></i>
        <div>
          <i class="lucide-settings"></i>
        </div>
      </div>
    `;
		const result = replaceLucideIcons(input);
		expect(result).toMatch(/<span class=""><svg>MockedSvg<\/svg><\/span>/);
		expect(result.match(/<svg>MockedSvg<\/svg>/g)?.length).toBe(2);
		expect(result).toMatch(/Some text/);
	});

	it("should handle multiple classes and attributes", () => {
		const input =
			'<i class="lucide-home custom-class" style="color: red;" data-test="icon"></i>';
		const result = replaceLucideIcons(input);
		expect(result).toMatch(
			/<span class="custom-class" style="color: red;" data-test="icon"><svg>MockedSvg<\/svg><\/span>/,
		);
	});
});
