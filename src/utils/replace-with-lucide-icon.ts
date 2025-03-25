import { getIconSvg } from "./get-icon-svg";

/**
 * 替换HTML字符串中的Lucide图标为SVG
 * @param html - 包含Lucide图标的HTML字符串
 * @returns 替换后的HTML字符串
 */
export function replaceLucideIcons(html: string): string {
	// 检查是否包含转义引号
	const hasEscapedQuotes = html.includes('\\"');

	// 处理转义引号的情况以便于正则匹配
	const processedHtml = hasEscapedQuotes ? html.replace(/\\"/g, '"') : html;

	// 匹配 <i class="lucide-[icon-name]"> 格式的标签
	const iconPattern =
		/<i\s+([^>]*?)class=(['"])([^'"]*?lucide-[^'"]+)(['"])([^>]*)><\/i>/g;

	// 进行替换
	const result = processedHtml.replace(
		iconPattern,
		(match, beforeClass, openQuote, classValue, closeQuote, afterClass) => {
			// 获取图标名称
			const iconClass = classValue
				.split(/\s+/)
				.find((c: string) => c.startsWith("lucide-"));
			if (!iconClass) return match;

			const iconName = iconClass.replace("lucide-", "");

			// 获取SVG
			const svg = getIconSvg(iconName);

			// 如果获取不到SVG，返回原始标签
			if (!svg) {
				return match;
			}

			// 构建新的class，保留原有class
			const newClass = classValue
				.split(/\s+/)
				.filter((c: string) => !c.startsWith("lucide-"))
				.join(" ");

			// 构建新标签，保留原有属性和class
			return `<span ${beforeClass}class=${openQuote}${newClass}${closeQuote}${afterClass}>${svg}</span>`;
		},
	);

	// 如果原始HTML包含转义引号，则在结果中也使用转义引号
	return hasEscapedQuotes ? result.replace(/"/g, '\\"') : result;
}
