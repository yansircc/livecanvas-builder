'use client'

import { type ReactNode } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface TailwindTabsProps {
  colorsTabContent: ReactNode
  typographyTabContent: ReactNode
  componentsTabContent: ReactNode
}

export function TailwindTabs({
  colorsTabContent,
  typographyTabContent,
  componentsTabContent,
}: TailwindTabsProps) {
  return (
    <Tabs defaultValue="colors" className="w-full">
      <TabsList className="mb-4 grid w-full grid-cols-3">
        <TabsTrigger value="colors">颜色</TabsTrigger>
        <TabsTrigger value="typography">字体</TabsTrigger>
        <TabsTrigger value="components">组件</TabsTrigger>
      </TabsList>

      <TabsContent value="colors" className="space-y-6">
        {colorsTabContent}
      </TabsContent>

      <TabsContent value="typography" className="space-y-6">
        {typographyTabContent}
      </TabsContent>

      <TabsContent value="components" className="space-y-6">
        {componentsTabContent}
      </TabsContent>
    </Tabs>
  )
}
