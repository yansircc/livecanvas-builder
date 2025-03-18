'use client'

import { Check, ChevronsUpDown, Info, X } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { getUnsplashImage } from '@/lib/unsplash'

// Define our own radio group components if not available in the UI library
interface RadioGroupProps {
  value: string
  onValueChange: (value: string) => void
  className?: string
  children: React.ReactNode
}

const RadioGroup: React.FC<RadioGroupProps> = ({ value, onValueChange, className, children }) => {
  return <div className={className}>{children}</div>
}

interface RadioGroupItemProps {
  value: string
  id: string
  className?: string
}

const RadioGroupItem: React.FC<RadioGroupItemProps> = ({ value, id, className }) => {
  return <input type="radio" id={id} value={value} className={className} />
}

// Define our own popover components if not available in the UI library
interface PopoverProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const Popover: React.FC<PopoverProps> = ({ open, onOpenChange, children }) => {
  return <div className="relative">{children}</div>
}

interface PopoverTriggerProps {
  asChild?: boolean
  children: React.ReactNode
}

const PopoverTrigger: React.FC<PopoverTriggerProps> = ({ asChild, children }) => {
  return <div>{children}</div>
}

interface PopoverContentProps {
  className?: string
  children: React.ReactNode
}

const PopoverContent: React.FC<PopoverContentProps> = ({ className, children }) => {
  return <div className={`absolute z-50 mt-2 ${className}`}>{children}</div>
}

interface ComponentPreviewProps {
  primaryColor: string
  secondaryColor: string
  headingFont: string
  bodyFont: string
  monoFont: string
  onButtonStyleChange: (style: ButtonStyle) => void
}

export type ButtonStyle = 'default' | 'outline' | 'soft' | 'gradient'

const buttonStyles: Record<ButtonStyle, { name: string; description: string }> = {
  default: {
    name: 'Default',
    description: 'Solid background with high contrast',
  },
  outline: {
    name: 'Outline',
    description: 'Bordered with transparent background',
  },
  soft: {
    name: 'Soft',
    description: 'Light background with subtle contrast',
  },
  gradient: {
    name: 'Gradient',
    description: 'Gradient background from primary to secondary',
  },
}

export function ComponentPreview({
  primaryColor,
  secondaryColor,
  headingFont,
  bodyFont,
  monoFont,
  onButtonStyleChange,
}: ComponentPreviewProps) {
  const [selectedButtonStyle, setSelectedButtonStyle] = useState<ButtonStyle>('default')
  const [isOpen, setIsOpen] = useState(false)

  // Generate random images once on component mount
  const cardImage = getUnsplashImage('architecture')
  const avatarImage = getUnsplashImage('people')

  const handleButtonStyleChange = (value: string) => {
    const style = value as ButtonStyle
    setSelectedButtonStyle(style)
    onButtonStyleChange(style)
  }

  // Button style CSS based on the selected style
  const getButtonStyleCSS = (style: ButtonStyle) => {
    switch (style) {
      case 'default':
        return { backgroundColor: primaryColor, color: 'white' }
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: primaryColor,
          borderColor: primaryColor,
          borderWidth: '1px',
        }
      case 'soft':
        return { backgroundColor: `${primaryColor}20`, color: primaryColor }
      case 'gradient':
        return {
          background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
          color: 'white',
        }
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-sm font-medium">Button Style</h3>
        <RadioGroup
          value={selectedButtonStyle}
          onValueChange={handleButtonStyleChange}
          className="grid grid-cols-2 gap-4"
        >
          {Object.entries(buttonStyles).map(([style, { name, description }]) => (
            <div key={style} className="relative">
              <RadioGroupItem value={style} id={`button-style-${style}`} className="peer sr-only" />
              <Label
                htmlFor={`button-style-${style}`}
                className="border-muted bg-card hover:border-primary peer-data-[state=checked]:border-primary flex cursor-pointer flex-col gap-2 rounded-md border-2 p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">{name}</p>
                  <Check className="h-4 w-4 opacity-0 peer-data-[state=checked]:opacity-100" />
                </div>
                <div
                  className="flex h-10 items-center justify-center rounded-md text-sm"
                  style={getButtonStyleCSS(style as ButtonStyle)}
                >
                  Button
                </div>
                <p className="text-muted-foreground text-xs">{description}</p>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="border-t pt-8">
        <h3 className="mb-4 text-sm font-medium">Components Preview</h3>

        <div className="space-y-6">
          {/* Card Preview */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: `${headingFont}, sans-serif` }}>
                Card Component
              </CardTitle>
              <CardDescription>This card uses your design system styling</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 aspect-video overflow-hidden rounded-md">
                <Image
                  src={cardImage}
                  alt="Preview"
                  width={600}
                  height={400}
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="text-sm" style={{ fontFamily: `${bodyFont}, sans-serif` }}>
                Cards are containers that group related content and actions. They can contain
                various elements like text, images, and buttons.
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button style={getButtonStyleCSS(selectedButtonStyle)}>Action</Button>
            </CardFooter>
          </Card>

          {/* Popup/Tooltip Preview */}
          <div className="flex justify-center py-4">
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <span>Popover Preview</span>
                  <ChevronsUpDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full">
                      <Image
                        src={avatarImage}
                        alt="Avatar"
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h4
                        className="text-sm font-medium"
                        style={{ fontFamily: `${headingFont}, sans-serif` }}
                      >
                        Popover Title
                      </h4>
                      <p
                        className="text-muted-foreground text-xs"
                        style={{ fontFamily: `${bodyFont}, sans-serif` }}
                      >
                        Contextual popup with content
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                    <Button size="sm" style={getButtonStyleCSS(selectedButtonStyle)}>
                      Action
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Alert Preview */}
          <div className="border-secondary bg-secondary-50 flex items-center gap-3 rounded-md border-l-4 p-4">
            <Info className="text-secondary h-5 w-5" />
            <div>
              <h4
                className="text-sm font-medium"
                style={{ fontFamily: `${headingFont}, sans-serif` }}
              >
                Alert Component
              </h4>
              <p
                className="text-muted-foreground text-xs"
                style={{ fontFamily: `${bodyFont}, sans-serif` }}
              >
                This is an informational alert using your secondary color.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
