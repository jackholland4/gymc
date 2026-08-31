'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'

const KB_ANIMS = ['kenburns-1', 'kenburns-2', 'kenburns-3', 'kenburns-4']

export interface Slide {
  src: string
  position?: string
}

interface Props {
  images: (string | Slide)[]
  interval?: number
  transitionDuration?: number
  kenBurnsDuration?: number
}

function toSlide(s: string | Slide): Slide {
  return typeof s === 'string' ? { src: s } : s
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function KenBurnsSlideshow({
  images,
  interval = 7000,
  transitionDuration = 2000,
  kenBurnsDuration = 12000,
}: Props) {
  const [deck, setDeck] = useState<Slide[]>(images.map(toSlide))
  const [slideNum, setSlideNum] = useState(0)

  useEffect(() => {
    setDeck(shuffle(images.map(toSlide)))
  }, [images])

  useEffect(() => {
    if (deck.length <= 1) return
    const id = setInterval(() => setSlideNum(n => n + 1), interval)
    return () => clearInterval(id)
  }, [deck.length, interval])

  if (deck.length === 0) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-black" />
    )
  }

  const curr = slideNum % deck.length
  const slide = deck[curr]
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
            src={slide.src}
            alt=""
            fill
            className="object-cover grayscale"
            style={{ objectPosition: slide.position ?? 'center' }}
            sizes="100vw"
            priority={slideNum === 0}
            unoptimized={slide.src.includes('.avif')}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
