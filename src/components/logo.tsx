'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export default function Logo() {
  return (
    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full p-0">
      <motion.div
        animate={{
          rotate: [0, -10, 10, -10, 10, 0],
          scale: [1, 1.1, 1.1, 1.1, 1.1, 1],
        }}
        transition={{
          duration: 1,
        }}
      >
        <Image
          src="/images/site-logo.png"
          alt="Logo"
          width={36}
          height={36}
          className="rounded-full transition-transform hover:rotate-12"
          priority
        />
      </motion.div>
    </Button>
  )
}
