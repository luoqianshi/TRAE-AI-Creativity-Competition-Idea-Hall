import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, BellRing, Check, ChevronRight, HeartPulse, Plus, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { ItemIcon } from '../components/item-icon'
import { itemVariants, PageHeader, PrimaryButton } from '../components/ui'
import { medicines } from '../data/mock-data'
import { useHomeStore } from '../store/use-home-store'

const statusText = { fresh: '库存充足', warning: '即将用完', urgent: '紧急补充' }

export function MedicinesPage() {
  const selected = useHomeStore((state) => state.selectedMedicines)
  const toggle = useHomeStore((state) => state.toggleMedicine)
  const [interactionOpen, setInteractionOpen] = useState(false)
  return <div className="page-container">
    <PageHeader eyebrow="健康守护 · 药箱状态" title="按时服药，也按时照顾自己。" description="统一掌握用药提醒、库存余量与潜在相互作用。所有数据当前仅保存在本地设备。" action={<div className="status-orbit rose"><HeartPulse/><div><strong>3</strong><span>条今日提醒</span></div></div>} />
    <section className="content-section pt-0"><div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h2 className="section-heading">家庭药箱</h2><p className="mt-2 text-sm text-white/40">选择药品进行批量库存管理</p></div><PrimaryButton><Plus size={18}/>记录新药品</PrimaryButton></div>
      <motion.div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" initial="hidden" animate="show" transition={{ staggerChildren: .07 }}>{medicines.map((item) => { const active = selected.includes(item.id); return <motion.button variants={itemVariants} key={item.id} onClick={() => toggle(item.id)} className={`medicine-card group ${active ? 'selected' : ''}`} whileHover={{ y: -5 }}>{active && <span className="selected-check"><Check size={13}/></span>}<div className="flex items-start justify-between"><div className="item-icon-wrap group-hover:scale-105"><ItemIcon name={item.icon} size={30}/></div><span className={`status-label ${item.status}`}>{statusText[item.status]}</span></div><h3 className="mt-7 text-left text-lg font-medium">{item.name}</h3><p className="mt-1 text-left text-sm text-white/38">{item.category} · {item.dosage}</p><div className="mt-6 flex items-end justify-between border-t border-white/7 pt-5"><div className="text-left"><span className="text-xs text-white/35">当前库存</span><p className="mt-1 text-2xl font-medium">{item.stock}<span className="ml-1 text-xs text-white/35">份</span></p></div><div className="text-right"><span className="text-xs text-white/35">下次提醒</span><p className="mt-1 text-sm text-teal-200">{item.nextDose}</p></div></div></motion.button>})}</motion.div>
    </section>
    <section className="content-section"><div className="grid gap-4 lg:grid-cols-12"><article className="result-panel lg:col-span-7"><div className="flex items-center gap-3"><span className="feature-icon rose"><BellRing/></span><div><h2 className="section-heading">今日服药提醒</h2><p className="mt-1 text-sm text-white/40">3 项计划 · 已完成 1 项</p></div></div><div className="mt-8 space-y-2"><Dose time="08:00" name="复合维生素" done/><Dose time="20:00" name="降压药"/><Dose time="21:00" name="感冒颗粒"/></div></article><article className="result-panel lg:col-span-5"><span className="feature-icon"><ShieldCheck/></span><h2 className="mt-6 section-heading">药物相互作用检测</h2><p className="mt-3 text-sm leading-7 text-white/45">检查已选药品之间可能存在的冲突。结果仅作健康管理参考，不能替代医生或药师建议。</p><button onClick={() => setInteractionOpen(true)} className="secondary-button mt-8 w-full justify-between">检测 {selected.length || '所选'} 种药品 <ChevronRight size={17}/></button></article></div></section>
    <AnimatePresence>{interactionOpen && <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setInteractionOpen(false)}><motion.div className="modal-card" initial={{ scale: .9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .9 }} onClick={(event) => event.stopPropagation()}><span className="feature-icon"><ShieldCheck/></span><h2 className="mt-6 text-2xl font-medium">未发现明显相互作用</h2><p className="mt-3 text-sm leading-7 text-white/50">当前选择的药品在模拟数据库中没有已知高风险冲突。处方药请始终遵医嘱使用。</p><div className="mt-5 flex gap-3 rounded-xl bg-amber-300/[.07] p-4 text-xs leading-6 text-amber-100/60"><AlertTriangle size={18} className="shrink-0"/>此检测是产品交互演示，不构成医学建议。</div><PrimaryButton className="mt-7 w-full justify-center" onClick={() => setInteractionOpen(false)}>我知道了</PrimaryButton></motion.div></motion.div>}</AnimatePresence>
  </div>
}

function Dose({ time, name, done = false }: { time: string; name: string; done?: boolean }) { return <div className={`plan-row p-4 ${done ? 'opacity-45' : ''}`}><span className="w-12 text-xs text-white/35">{time}</span><span className={`grid size-8 place-items-center rounded-full ${done ? 'bg-teal-300 text-black' : 'bg-white/6 text-white/40'}`}>{done ? <Check size={15}/> : <BellRing size={14}/>}</span><strong>{name}</strong><span className="ml-auto text-xs text-white/35">{done ? '已服用' : '待服用'}</span></div> }
