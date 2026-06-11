'use client'

import { motion } from 'framer-motion'

interface RedRuleProps {
  delay?: number
  centered?: boolean
}

export function RedRule({ delay = 0.5, centered = false }: RedRuleProps) {
  return (
    <motion.div
      className={`h-0.5 bg-[#dc2626] mt-4 rounded-full ${centered ? 'mx-auto' : ''}`}
      initial={{ width: 0 }}
      animate={{ width: 60 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
    />
  )
}
