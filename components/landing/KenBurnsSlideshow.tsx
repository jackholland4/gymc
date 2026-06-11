'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'

const KB_ANIMS = ['kenburns-1', 'kenburns-2', 'kenburns-3', 'kenburns-4']

interface Props {
  images: string[]
  interval?: number
  transitionDuration?: number
  kenBurnsDuration?: number
}

export default function KenBurnsSlideshow({
  images,
  interval = 7000,
  transitionDuration = 2000,
  kenBurnsDuration = 12000,
}: Props) {
  const [slideNum, setSlideNum] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return
    const id = setInterval(() => setSlideNum(n => n + 1), interval)
    return () => clearInterval(id)
  }, [images.length, interval])

  if (images.length === 0) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-black" />
    )
  }

  const curr = slideNum % images.length
  const animName = KB_ANIMS[slideNum % KB_ANIMS.length]

  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence>
        <motion.div
          key={slideNum}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: transitionDuration / 1000, ease: 'easeInOut' }}
          className="absolute inset-0"
          style={{
            animationName: animName,
            animationDuration: `${kenBurnsDuration}ms`,
            animationTimingFunction: 'linear',
            animationFillMode: 'both',
            willChange: 'transform, opacity',
          }}
        >
          <Image
            src={images[curr]}
            alt=""
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority={slideNum === 0}
            unoptimized={images[curr].includes('.avif')}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
