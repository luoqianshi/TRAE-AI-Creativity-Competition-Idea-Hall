import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, Check, ChefHat, Lightbulb, ListChecks, Refrigerator, ShoppingBasket, Snowflake } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { ItemIcon } from '../components/item-icon'
import { EmptyNote, itemVariants, PageHeader, PrimaryButton } from '../components/ui'
import { ingredients } from '../data/mock-data'
import { useHomeStore } from '../store/use-home-store'

const statusText = { fresh: '新鲜', warning: '即将过期', urgent: '紧急处理' }

export function FridgePage() {
  const selected = useHomeStore((state) => state.selectedIngredients)
  const toggle = useHomeStore((state) => state.toggleIngredient)
  const [generated, setGenerated] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)
  const chosen = useMemo(() => ingredients.filter((item) => selected.includes(item.id)), [selected])
  const priority = [...(chosen.length ? chosen : ingredients.filter((item) => item.status !== 'fresh'))].sort((a, b) => a.daysLeft - b.daysLeft)

  const generate = () => { setGenerated(true); window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120) }

  return <div className="page-container">
    <PageHeader eyebrow="食材感知 · 实时库存" title="今晚先吃什么，冰箱已经替你想好。" description="点选想优先处理的食材，系统会结合保质期与搭配关系生成三日清空计划。" action={<div className="status-orbit"><Refrigerator/><div><strong>8</strong><span>种食材在线</span></div></div>} />

    <section className="content-section pt-0"><div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h2 className="section-heading">冰箱清单</h2><p className="mt-2 text-sm text-white/40">已选择 {selected.length} 项 · 点击卡片切换</p></div><PrimaryButton onClick={generate}><ChefHat size={18}/>生成清空计划<ArrowDown size={16}/></PrimaryButton></div>
      <motion.div className="grid grid-cols-2 gap-3 md:grid-cols-4" initial="hidden" animate="show" transition={{ staggerChildren: .06 }}>
        {ingredients.map((item) => { const active = selected.includes(item.id); return <motion.button variants={itemVariants} key={item.id} onClick={() => toggle(item.id)} whileHover={{ y: -5 }} whileTap={{ scale: .97 }} className={`ingredient-card group ${active ? 'selected' : ''} ${item.status === 'urgent' ? 'urgent' : ''}`}>
          <span className={`status-dot ${item.status}`} />{active && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="selected-check"><Check size={13}/></motion.span>}
          <div className="item-icon-wrap group-hover:scale-105"><ItemIcon name={item.icon} size={32}/></div><div className="mt-7 text-left"><span className="text-xs text-white/35">{item.category} · {item.amount}</span><h3 className="mt-1 text-lg font-medium">{item.name}</h3><span className={`status-label ${item.status}`}>{item.daysLeft} 天后到期 · {statusText[item.status]}</span></div>
        </motion.button> })}
      </motion.div>
    </section>

    <AnimatePresence>{generated && <motion.section ref={resultsRef} className="content-section scroll-mt-24" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div className="mb-10"><p className="eyebrow">家智 AI 已完成分析</p><h2 className="section-title">三天刚刚好，<br/>一口都不浪费。</h2></div>
      <div className="grid grid-flow-dense grid-cols-1 gap-4 lg:grid-cols-12">
        <ResultCard icon={<ListChecks/>} title="优先消耗顺序" className="lg:col-span-5 lg:row-span-2"><div className="mt-6 space-y-2">{priority.map((item, index) => <motion.div key={item.id} initial={{ x: -12, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: index * .08 }} className="plan-row"><span className="plan-index">{String(index + 1).padStart(2, '0')}</span><ItemIcon name={item.icon} size={20}/><strong>{item.name}</strong><span className="ml-auto text-xs text-white/40">{item.daysLeft} 天</span></motion.div>)}</div></ResultCard>
        <ResultCard icon={<ChefHat/>} title="未来 3 天菜单" className="lg:col-span-7"><div className="mt-6 grid gap-3 sm:grid-cols-3"><MenuDay day="今晚" meal="香煎三文鱼" note="搭配番茄菠菜沙拉"/><MenuDay day="明天" meal="口蘑鸡肉烩饭" note="使用牛奶增加奶香"/><MenuDay day="后天" meal="蓝莓蛋奶早餐" note="消耗鸡蛋与剩余乳品"/></div></ResultCard>
        <ResultCard icon={<ShoppingBasket/>} title="缺少的调料" className="lg:col-span-3"><div className="mt-5 flex flex-wrap gap-2">{['黑胡椒', '迷迭香', '橄榄油'].map((item) => <span className="chip" key={item}>{item}</span>)}</div></ResultCard>
        <ResultCard icon={<Snowflake/>} title="保存建议" className="lg:col-span-4"><p className="mt-5 text-sm leading-7 text-white/55">菠菜用厨房纸包裹冷藏；三文鱼今晚未食用则立即冷冻；蓝莓保持干燥并单层存放。</p></ResultCard>
      </div><div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-300/15 bg-amber-300/[.06] p-5 text-sm text-amber-100/70"><Lightbulb size={19} className="shrink-0"/><p>菜单为模拟 AI 推荐。接入 LLM 后可根据人数、忌口与烹饪时间实时调整。</p></div>
    </motion.section>}</AnimatePresence>
    {!generated && <div className="content-section pt-0"><EmptyNote>选择食材并生成计划，分析结果会在这里展开。</EmptyNote></div>}
  </div>
}

function ResultCard({ icon, title, className = '', children }: { icon: React.ReactNode; title: string; className?: string; children: React.ReactNode }) { return <motion.article className={`result-panel ${className}`} initial={{ opacity: 0, y: 30, scale: .96 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }}><div className="flex items-center gap-3 text-teal-200">{icon}<h3 className="font-medium text-white">{title}</h3></div>{children}</motion.article> }
function MenuDay({ day, meal, note }: { day: string; meal: string; note: string }) { return <div className="rounded-2xl bg-white/[.045] p-4"><span className="text-xs text-teal-300">{day}</span><strong className="mt-5 block">{meal}</strong><p className="mt-2 text-xs leading-5 text-white/40">{note}</p></div> }
