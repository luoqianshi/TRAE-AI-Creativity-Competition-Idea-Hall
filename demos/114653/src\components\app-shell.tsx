import { AnimatePresence, motion } from 'framer-motion'
import { HeartPulse, Home, Menu, PackageCheck, Refrigerator, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

const links = [
  { to: '/', label: '家庭总览', icon: Home },
  { to: '/fridge', label: '冰箱食材', icon: Refrigerator },
  { to: '/medicines', label: '药品健康', icon: HeartPulse },
  { to: '/checklist', label: '出门检查', icon: PackageCheck },
]

export function AppShell() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigation = <>{links.map(({ to, label, icon: Icon }) => (
    <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
      <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
    </NavLink>
  ))}</>

  return <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#06100e] text-white">
    <div className="ambient" />
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 lg:px-8">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between rounded-2xl border border-white/10 bg-[#081512]/80 px-4 py-3 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <NavLink to="/" className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-teal-300 text-[#05211b]"><Sparkles size={19} /></span>
          <span className="font-semibold tracking-tight">栖知</span><span className="hidden text-xs text-white/35 sm:block">QIZHI HOME</span>
        </NavLink>
        <nav className="hidden items-center gap-1 lg:flex">{navigation}</nav>
        <div className="hidden items-center gap-2 text-xs text-white/50 sm:flex"><span className="size-2 rounded-full bg-teal-300 shadow-[0_0_14px_#5eead4]" />家庭状态正常</div>
        <button className="icon-button lg:hidden" onClick={() => setOpen(true)} aria-label="打开菜单"><Menu size={20} /></button>
      </div>
    </header>
    <AnimatePresence>{open && <motion.div className="fixed inset-0 z-[60] bg-black/70 p-4 backdrop-blur-lg lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
      <motion.nav className="ml-auto flex h-full max-w-xs flex-col rounded-3xl border border-white/10 bg-[#0a1714] p-5" initial={{ x: 100 }} animate={{ x: 0 }} exit={{ x: 100 }} onClick={(event) => event.stopPropagation()}>
        <button className="icon-button mb-8 ml-auto" onClick={() => setOpen(false)}><X size={20} /></button>{navigation}
      </motion.nav>
    </motion.div>}</AnimatePresence>
    <AnimatePresence mode="wait"><motion.div key={location.pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .35 }}><Outlet /></motion.div></AnimatePresence>
    <footer className="border-t border-white/8 px-5 py-10 text-sm text-white/35"><div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-4 sm:flex-row"><span>栖知 · 让家庭事务更轻盈</span><span>本地优先 · 隐私安全 · AI 协同</span></div></footer>
  </main>
}
