import { MainNav } from '@/components/main-nav'
import { ThemeGenerator } from './components/theme-generator'

export default function WizardV2() {
  return (
    <div className="flex flex-col gap-8">
      <MainNav />
      <div className="container mx-auto max-w-screen-xl py-8">
        <ThemeGenerator />
      </div>
    </div>
  )
}
