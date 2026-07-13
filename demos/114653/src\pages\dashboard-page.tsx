import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, CloudRain, HeartPulse, PackageCheck, Refrigerator, Sparkles, TrendingUp } from 'lucide-react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useHomeStore } from '../store/use-home-store'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function DashboardPage() {
  const scope = useRef<HTMLDivElement>(null)
  const checklist = useHomeStore((state) => state.checklist)
  const done = checklist.filter((item) => item.checked).length

  useGSAP(() => {
    gsap.from('.hero-copy > *', { y: 40, opacity: 0, stagger: .12, duration: .9, ease: 'power3.out' })
    gsap.utils.toArray<HTMLElement>('.reveal-word').forEach((word, index) => gsap.to(word, { opacity: 1, scrollTrigger: { trigger: '.manifesto', start: `top+=${index * 8} 72%`, end: 'bottom 45%', scrub: true } }))
    gsap.utils.toArray<HTMLElement>('.stack-card').forEach((card, index) => gsap.from(card, { scale: .9, y: 70, opacity: .2, scrollTrigger: { trigger: card, start: 'top 90%', end: 'top 48%', scrub: 1 }, zIndex: index }))
  }, { scope })

  const words = '家务不该占据你的注意力。栖知理解食材的新鲜度、药品的余量，以及每次出门真正需要带上的东西。'.split('')

  return <div ref={scope}>
    <section className="relative flex min-h-[92vh] items-end overflow-hidden px-5 pb-20 pt-32 lg:px-10 lg:pb-24">
      <div className="hero-orb" /><div className="hero-grid" />
      <div className="hero-copy relative z-10 mx-auto w-full max-w-[1500px]">
        <p className="eyebrow">AI 家庭协同系统 · 今晚 19:42</p>
        <h1 className="max-w-6xl text-[clamp(3.1rem,7.5vw,7.8rem)] font-medium leading-[.88] tracking-[-.065em]">家里的一切，<br/><span className="text-teal-300">心里都有数。</span></h1>
        <div className="mt-10 flex max-w-4xl flex-col justify-between gap-8 md:flex-row md:items-end">
          <p className="max-w-xl text-base leading-7 text-white/55 md:text-lg">从冰箱里的最后一盒牛奶，到明早出门前的雨伞。栖知，是一个安静、可靠、始终在线的家庭智能中枢。</p>
          <div className="flex gap-3"><Link to="/fridge" className="primary-button">开始清空冰箱 <ArrowRight size={17}/></Link><Link to="/checklist" className="secondary-button">出门检查</Link></div>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-[1500px] px-5 py-24 lg:px-10 lg:py-40">
      <div className="grid grid-flow-dense grid-cols-1 gap-3 lg:grid-cols-12">
        <Link to="/fridge" className="feature-card group min-h-[330px] lg:col-span-6 lg:row-span-2"><div><span className="feature-icon"><Refrigerator /></span><h2>冰箱里，<br/>有 4 样该先吃</h2><p>智能计划已按保质期排好今晚的优先顺序。</p></div><div className="ingredient-visual"><span>番茄</span><span>三文鱼</span><span>牛奶</span></div></Link>
        <Link to="/medicines" className="feature-card group min-h-[240px] lg:col-span-3"><span className="feature-icon rose"><HeartPulse /></span><h3>降压药余量偏低</h3><p>仅余 6 片，建议本周补充。</p><span className="card-link">管理药箱 <ArrowRight size={15}/></span></Link>
        <div className="feature-card weather min-h-[240px] lg:col-span-3"><span className="feature-icon blue"><CloudRain /></span><h3>雷阵雨 · 27°C</h3><p>18:30 后降雨概率 82%，出门记得带伞。</p></div>
        <Link to="/checklist" className="feature-card group min-h-[240px] lg:col-span-3"><span className="feature-icon"><PackageCheck /></span><h3>出门准备 {done}/12</h3><div className="mt-6 h-1 overflow-hidden rounded-full bg-white/8"><div className="h-full bg-teal-300" style={{ width: `${done / 12 * 100}%` }}/></div><span className="card-link">继续检查 <ArrowRight size={15}/></span></Link>
        <div className="feature-card min-h-[240px] lg:col-span-3"><span className="feature-icon amber"><TrendingUp /></span><h3>本周节省 2.4 小时</h3><p>通过自动提醒与清单整理，少做 17 次重复判断。</p></div>
      </div>
    </section>

    <section className="manifesto mx-auto max-w-6xl px-5 py-28 text-center lg:py-52"><p className="text-[clamp(2rem,4.8vw,5rem)] font-medium leading-[1.22] tracking-[-.045em]">{words.map((word, index) => <span key={index} className="reveal-word opacity-10">{word}</span>)}</p></section>

    <section className="mx-auto max-w-[1500px] px-5 py-24 lg:px-10 lg:py-44"><div className="mb-14 flex items-end justify-between"><div><p className="eyebrow">今晚的家庭脉搏</p><h2 className="section-title">先处理重要的，<br/>其余交给系统。</h2></div><Sparkles className="hidden text-teal-300 md:block" size={40}/></div>
      <div className="space-y-5"><div className="stack-card result-card border-red-400/20"><span className="result-number">01</span><div><h3>优先消耗临期食材</h3><p>番茄与三文鱼将在 1 天内到期，已组合进今晚菜单。</p></div><Link to="/fridge" className="icon-button"><ArrowRight/></Link></div><div className="stack-card result-card border-violet-400/20"><span className="result-number">02</span><div><h3>检查药品库存</h3><p>两种常备药余量不足，可一键加入购物清单。</p></div><Link to="/medicines" className="icon-button"><ArrowRight/></Link></div><div className="stack-card result-card border-teal-300/20"><span className="result-number">03</span><div><h3>准备商务出行</h3><p>结合天气与行程，系统推荐电脑、充电宝、雨伞和口罩。</p></div><Link to="/checklist" className="icon-button"><ArrowRight/></Link></div></div>
    </section>

    <section className="mx-5 mb-8 rounded-[2.2rem] bg-teal-300 px-6 py-20 text-center text-[#041b16] lg:mx-10 lg:py-28"><h2 className="mx-auto max-w-4xl text-[clamp(2.5rem,5vw,5.5rem)] font-semibold leading-[.95] tracking-[-.055em]">少一点琐事，<br/>多一点生活。</h2><Link to="/fridge" className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#041b16] px-7 py-4 font-medium text-white">现在开始 <ArrowRight size={17}/></Link></section>
  </div>
}
