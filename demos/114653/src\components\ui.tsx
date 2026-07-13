import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <section className="page-header"><div className="max-w-3xl"><p className="eyebrow">{eyebrow}</p><h1 className="page-title">{title}</h1><p className="page-description">{description}</p></div>{action}</section>
}

export function PrimaryButton({ children, className = '', ...props }: HTMLMotionProps<'button'>) {
  return <motion.button whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: .97 }} className={`primary-button ${className}`} {...props}>{children}</motion.button>
}

export function EmptyNote({ children }: { children: ReactNode }) { return <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/45">{children}</div> }

export const itemVariants = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }
