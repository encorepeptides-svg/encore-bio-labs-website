import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion'

type RevealProps = HTMLMotionProps<'div'> & {
  as?: 'div' | 'article'
  delay?: number
  y?: number
}

export function Reveal({ as = 'div', children, delay = 0, y = 18, ...props }: RevealProps) {
  const prefersReducedMotion = useReducedMotion()
  const Component = as === 'article' ? motion.article : motion.div

  return (
    <Component
      initial={prefersReducedMotion ? false : { opacity: 0, y }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, ease: 'easeOut', delay }}
      {...props}
    >
      {children}
    </Component>
  )
}
