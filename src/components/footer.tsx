export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white py-4 dark:border-zinc-800 dark:bg-zinc-900">
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          © {new Date().getFullYear()} LiveCanvas Builder
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">使用 AI 构建美观的 HTML 组件</p>
      </div>
    </div>
  </footer>
  )
}

