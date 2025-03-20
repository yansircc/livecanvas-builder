import { ThemeGenerator } from './components/theme-generator'

export default function WizardV2() {
  return (
    <div className="container mx-auto max-w-screen-xl py-8">
      <h1 className="mb-6 text-3xl font-bold">UI 主题生成器</h1>
      <ThemeGenerator />
    </div>
  )
}
