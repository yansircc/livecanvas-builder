import { Footer } from "@/components/footer";
import { MainNav } from "@/components/nav/main-nav";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code, Layers, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
	return (
		<div className="flex min-h-screen flex-col">
			{/* Header */}
			<MainNav />

			{/* Hero Section */}
			<section className="container mx-auto flex flex-col items-center justify-center py-20 text-center md:py-32">
				<h1 className="mb-6 font-bold text-4xl leading-tight md:text-6xl">
					利用 AI 构建精美的 Tailwind CSS 网页组件
				</h1>
				<p className="mb-10 max-w-2xl text-muted-foreground text-xl">
					LiveCanvas Builder 是一个强大的工具，利用 Aihubmax 为 LiveCanvas
					生成兼容 Tailwind CSS 的 HTML
					代码。通过简单的提示，你可以创建美观、响应式的网页组件。
				</p>
				<div className="flex flex-col gap-4 sm:flex-row">
					<Link href="/signup">
						<Button size="lg" className="gap-2">
							免费开始使用 <ArrowRight className="h-4 w-4" />
						</Button>
					</Link>
					<Link href="https://aihubmix.com/token" target="_blank">
						<Button size="lg" variant="outline">
							获取 API 密钥
						</Button>
					</Link>
				</div>
			</section>

			{/* Features Section */}
			<section className="container mx-auto py-20">
				<h2 className="mb-12 text-center font-bold text-3xl">强大功能</h2>
				<div className="grid gap-8 md:grid-cols-3">
					<div className="flex flex-col items-center rounded-lg border p-6 text-center">
						<div className="mb-4 rounded-full bg-primary/10 p-3">
							<Code className="h-6 w-6 text-primary" />
						</div>
						<h3 className="mb-2 font-semibold text-xl">AI 驱动的 HTML 生成</h3>
						<p className="text-muted-foreground">
							使用 Aihubmax 创建兼容 Tailwind CSS 的 HTML，轻松构建响应式组件。
						</p>
					</div>
					<div className="flex flex-col items-center rounded-lg border p-6 text-center">
						<div className="mb-4 rounded-full bg-primary/10 p-3">
							<Layers className="h-6 w-6 text-primary" />
						</div>
						<h3 className="mb-2 font-semibold text-xl">版本管理</h3>
						<p className="text-muted-foreground">
							跟踪并切换不同的生成代码版本，轻松比较和选择最佳结果。
						</p>
					</div>
					<div className="flex flex-col items-center rounded-lg border p-6 text-center">
						<div className="mb-4 rounded-full bg-primary/10 p-3">
							<Zap className="h-6 w-6 text-primary" />
						</div>
						<h3 className="mb-2 font-semibold text-xl">实时预览</h3>
						<p className="text-muted-foreground">
							通过响应式设备模拟立即预览你生成的
							HTML，确保在所有设备上完美显示。
						</p>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="bg-primary py-16 text-primary-foreground">
				<div className="container mx-auto text-center">
					<h2 className="mb-6 font-bold text-3xl">准备好开始使用了吗？</h2>
					<p className="mb-8 text-xl">
						立即注册并开始创建令人惊叹的 Tailwind CSS 组件。
					</p>
					<Link href="/signup">
						<Button size="lg" variant="secondary" className="gap-2">
							免费注册 <ArrowRight className="h-4 w-4" />
						</Button>
					</Link>
				</div>
			</section>

			{/* Footer */}
			<Footer />
		</div>
	);
}
