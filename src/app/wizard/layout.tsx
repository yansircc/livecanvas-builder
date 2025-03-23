import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
	title: "LiveCanvas - 创建向导",
	description: "使用向导快速创建LiveCanvas项目",
};

/**
 * 创建向导布局
 * 注意：身份验证由中间件自动处理，不需要在此检查
 */
export default function WizardLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	return <>{children}</>;
}
