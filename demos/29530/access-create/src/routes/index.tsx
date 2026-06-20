import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "可及 · 让真实需求被看见，让辅助工具被共创" },
      {
        name: "description",
        content:
          "可及是面向残障人士的辅助工具共创与共享平台 —— 残障用户发布真实需求，设计师参与 3D 建模与开源方案共创，爱心创客提供 3D 打印服务，让定制化辅助工具低成本触达每一个需要的人。",
      },
      { property: "og:title", content: "可及 · 让辅助工具被共创" },
      {
        property: "og:description",
        content: "残障人士、设计师、3D 打印创客的开放协作平台。",
      },
    ],
  }),
  component: Index,
});

const needs = [
  {
    id: "#082",
    title: "打不开矿泉水瓶",
    desc: "由于手指握力不足，市面上常见的矿泉水瓶盖太细且滑，无法独立开启。希望有一个轻便、可放进包里的杠杆式开瓶辅助工具。",
    scene: "户外出行 · 日常饮水",
    expect: "杠杆开瓶器 / 防滑套",
    status: "寻求设计中",
    statusTone: "amber",
    time: "2 小时前",
  },
  {
    id: "#079",
    title: "化妆盒难以开合",
    desc: "翻盖式粉饼盒的卡扣过紧，单手或手指不灵活时几乎无法打开，常常需要他人帮忙。",
    scene: "梳妆 · 个人日常",
    expect: "辅助卡扣 / 弹开结构",
    status: "已有方案",
    statusTone: "sage",
    time: "1 天前",
  },
  {
    id: "#075",
    title: "餐具握柄太细不稳",
    desc: "帕金森患者或中风康复者握不住细长的勺把和筷子，希望有可拆卸的加粗、防滑握柄套。",
    scene: "进餐 · 康复期",
    expect: "通用加粗握柄",
    status: "已有打印",
    statusTone: "blue",
    time: "3 天前",
  },
  {
    id: "#068",
    title: "墙面小开关按压困难",
    desc: "插线板及墙面小翘板开关受力点太小，渐冻症患者按下需要相当大的精准度与力气。",
    scene: "居家电器",
    expect: "增大按压面 / 杠杆延长",
    status: "已有打印",
    statusTone: "blue",
    time: "5 天前",
  },
  {
    id: "#061",
    title: "门把手难以下压",
    desc: "类风湿关节炎让手腕无法转动球形门把，希望有一个套在门把上、用手肘也能推下的延长结构。",
    scene: "居家通行",
    expect: "门把延长杠杆",
    status: "寻求设计中",
    statusTone: "amber",
    time: "1 周前",
  },
  {
    id: "#057",
    title: "药片铝箔难以挤出",
    desc: "每日要吃多种药，扣开药板对手指是一种折磨。希望能放在桌面上、轻轻一按就把药片挤出的工具。",
    scene: "每日服药",
    expect: "桌面式压药器",
    status: "已有方案",
    statusTone: "sage",
    time: "1 周前",
  },
];

const statusStyles: Record<string, string> = {
  amber: "bg-amber-100 text-amber-800",
  sage: "bg-[var(--sage-soft)] text-[color-mix(in_oklab,var(--sage)_75%,black)]",
  blue: "bg-sky-100 text-sky-800",
};

const solutions = [
  {
    name: "极简开盖助手 V2",
    forNeed: "针对 #082 矿泉水瓶",
    desc: "利用杠杆原理设计的通用型开盖器，支持瓶盖直径 25–45mm，单指即可开启。",
    author: "林晨 · 工业设计师",
    openSource: true,
    editable: true,
    downloads: 318,
  },
  {
    name: "通用餐具加粗握柄",
    forNeed: "针对 #075 餐具握柄",
    desc: "人体工程学握柄，可直接套入现有勺叉，PLA 材料，可水洗。已迭代到第 4 版。",
    author: "David W. · 创客",
    openSource: true,
    editable: true,
    downloads: 612,
  },
  {
    name: "磁吸式延长开关",
    forNeed: "针对 #068 小开关",
    desc: "磁吸结构吸附在现有翘板开关上，提供 15cm 受力臂，大幅减少按压所需力量。",
    author: "阿圆 · 学生团队",
    openSource: true,
    editable: false,
    downloads: 204,
  },
];

const printers = [
  {
    name: "陈老师的 3D 工作室",
    city: "上海 · 徐汇",
    material: "PLA / 工业级树脂",
    eta: "48 小时",
    price: "￥12 起 (材料费)",
  },
  {
    name: "立创社区打印中心",
    city: "深圳 · 南山",
    material: "PLA / 尼龙 / TPU",
    eta: "3–5 天",
    price: "￥15 起",
  },
  {
    name: "公益志愿者 · 老张",
    city: "北京 · 海淀",
    material: "PLA 环保耗材",
    eta: "1 周内",
    price: "免费 (仅自付快递)",
  },
  {
    name: "开源小分队 · 阿强",
    city: "成都 · 武侯",
    material: "PLA / PETG",
    eta: "5 天",
    price: "公益价 ￥5",
  },
];

const flow = [
  { n: "01", t: "发布问题", d: "残障用户描述具体生活困难、场景与期望。" },
  { n: "02", t: "浏览需求", d: "设计师与创客在需求广场认领真实问题。" },
  { n: "03", t: "共创建模", d: "线上沟通尺寸、材料，进行 3D 建模与迭代。" },
  { n: "04", t: "上传方案", d: "开放源代码与 STL 文件，进入共创方案库。" },
  { n: "05", t: "提供打印", d: "爱心创客认领打印，公益价或成本价交付。" },
  { n: "06", t: "低价获取", d: "用户获得真正适合自己的辅助工具。" },
];

function Index() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <a href="#" className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground text-sm font-bold">可</span>
            <span className="text-lg font-semibold tracking-tight">可及</span>
          </a>
          <div className="hidden gap-7 text-sm font-medium text-muted-foreground md:flex">
            <a href="#square" className="hover:text-primary transition-colors">需求广场</a>
            <a href="#solutions" className="hover:text-primary transition-colors">方案共创</a>
            <a href="#printers" className="hover:text-primary transition-colors">打印服务</a>
            <a href="#detail" className="hover:text-primary transition-colors">成果案例</a>
            <a href="#flow" className="hover:text-primary transition-colors">协作流程</a>
          </div>
          <a
            href="#post"
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            发布我的需求
          </a>
        </div>
      </nav>

      {/* Hero */}
      <header className="mx-auto max-w-6xl px-6 pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--sage-soft)] px-3 py-1 text-xs font-medium text-[color-mix(in_oklab,var(--sage)_75%,black)]">
            <span className="size-1.5 rounded-full bg-primary" /> 一个开放的辅助工具共创社区
          </span>
          <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.15] md:text-6xl">
            让真实需求被看见，<br />让辅助工具被共创。
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            可及连接残障人士、设计师与 3D 打印创客 —— 把生活中具体的困难转化为开源、可迭代、可低成本制作的辅助工具，让真正合适的解答抵达每一个需要的人。
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="#post"
              className="rounded-2xl bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              发布我的需求
            </a>
            <a
              href="#square"
              className="rounded-2xl bg-secondary px-7 py-3.5 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-[var(--sand)]"
            >
              浏览需求广场 →
            </a>
          </div>
          <div className="mt-12 flex flex-wrap gap-x-10 gap-y-4 text-sm text-muted-foreground">
            <Stat n="320+" label="真实需求" />
            <Stat n="186" label="开源方案" />
            <Stat n="142" label="打印创客" />
            <Stat n="¥18" label="平均交付成本" />
          </div>
        </div>
      </header>

      {/* Roles intro */}
      <section className="border-y border-border/60 bg-card/50">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-px overflow-hidden bg-border/60 md:grid-cols-4">
          {[
            { i: "01", t: "残障用户", d: "发布生活中遇到的具体障碍，让设计师听见真实的声音。" },
            { i: "02", t: "设计创作者", d: "基于真实需求 3D 建模，开源分享、社区共创、共同迭代。" },
            { i: "03", t: "打印服务者", d: "拥有 3D 打印机的爱心用户，以公益价或成本价帮忙生产。" },
            { i: "04", t: "受益使用者", d: "以更低成本、更定制化的方式，获得真正合适的辅助工具。" },
          ].map((r) => (
            <div key={r.i} className="bg-background p-8">
              <span className="font-mono text-xs text-primary">{r.i}</span>
              <h3 className="mt-3 text-lg font-semibold">{r.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Need Square */}
      <section id="square" className="mx-auto max-w-6xl px-6 py-24">
        <SectionHead
          eyebrow="需求广场"
          title="真实的障碍，正在等待解答"
          desc="每一张卡片都来自一位真实用户的具体困难。点击进入提供你的设计思路。"
          link={{ href: "#", label: "查看全部需求 →" }}
        />
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {needs.map((n) => (
            <article
              key={n.id}
              className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted-foreground">ID {n.id}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusStyles[n.statusTone]}`}>
                  {n.status}
                </span>
              </div>
              <h4 className="mt-4 text-lg font-bold transition-colors group-hover:text-primary">{n.title}</h4>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{n.desc}</p>
              <div className="mt-6 flex items-end justify-between border-t border-border pt-4 text-xs">
                <div className="space-y-1 text-muted-foreground">
                  <p>场景 · {n.scene}</p>
                  <p>期望 · {n.expect}</p>
                </div>
                <span className="text-muted-foreground/70">{n.time}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Post form */}
      <section id="post" className="bg-[var(--sage-soft)]/40 py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm md:p-12">
            <span className="font-mono text-xs text-primary">POST · 发布需求</span>
            <h2 className="mt-3 text-3xl font-bold">说出你遇到的困难</h2>
            <p className="mt-2 text-muted-foreground">
              描述越具体，越容易被设计师听见。我们会把它转化为可共创的设计任务。
            </p>

            {submitted ? (
              <div className="mt-10 rounded-2xl bg-[var(--sage-soft)] p-8 text-center">
                <p className="text-lg font-semibold text-primary">✓ 你的需求已提交</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  我们将在 24 小时内审核并发布到需求广场。
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  再发布一个需求
                </button>
              </div>
            ) : (
              <form
                className="mt-10 space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
              >
                <Field label="遇到的具体困难" required>
                  <input
                    required
                    type="text"
                    placeholder="例如：轮椅扶手过滑，长时间使用手掌疼痛"
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </Field>
                <Field label="在什么场景下遇到？" required>
                  <input
                    required
                    type="text"
                    placeholder="例如：居家通行 / 户外出行 / 进餐"
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </Field>
                <Field label="希望获得什么样的辅助工具？">
                  <input
                    type="text"
                    placeholder="例如：可拆卸的防滑握柄 / 杠杆延长结构"
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </Field>
                <Field label="尺寸、材料、使用方式等补充说明 (可选)">
                  <textarea
                    rows={4}
                    placeholder="例如：直径约 35mm，需要食品级、可水洗的材料"
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </Field>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input type="checkbox" defaultChecked className="size-4 rounded accent-[var(--sage)]" />
                  <span>我同意将这条需求公开展示在需求广场</span>
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  提交需求 →
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section id="solutions" className="mx-auto max-w-6xl px-6 py-24">
        <SectionHead
          eyebrow="方案共创区 · 可及 Vibe Coding"
          title="基于真实需求，快速建模与迭代"
          desc="设计师可以上传 3D 成品方案，或留下源代码、建模文件与项目阐述，让其他人继续修改、打印、迭代。"
          link={{ href: "#", label: "提交我的方案 →" }}
        />
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {solutions.map((s) => (
            <article key={s.name} className="overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-lg">
              <div className="grid aspect-[5/3] place-items-center bg-gradient-to-br from-[var(--sage-soft)] to-[var(--sand)] text-xs font-mono uppercase tracking-widest text-muted-foreground">
                3D 模型预览
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-1.5">
                  {s.openSource && <Tag>开源</Tag>}
                  {s.editable ? <Tag>可二次编辑</Tag> : <Tag muted>仅参考</Tag>}
                  <Tag>STL 可下载</Tag>
                </div>
                <h4 className="mt-4 text-lg font-bold">{s.name}</h4>
                <p className="mt-1 text-xs text-primary">{s.forNeed}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-full bg-[var(--sand)]" />
                    <span className="text-xs font-medium">{s.author}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">↓ {s.downloads}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Printers */}
      <section id="printers" className="border-y border-border/60 bg-card/50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHead
            eyebrow="打印服务区"
            title="爱心创客，帮你把方案变成实物"
            desc="拥有 3D 打印机的志愿者与小工作室，按城市、材料、价格清楚列出，让需求方可以就近联系。"
            link={{ href: "#", label: "我也想提供打印 →" }}
          />
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {printers.map((p) => (
              <div key={p.name} className="rounded-2xl border border-border bg-background p-6">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-[var(--sage-soft)] text-sm font-bold text-primary">
                    {p.name.slice(0, 1)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.city}</p>
                  </div>
                </div>
                <dl className="mt-5 space-y-2 text-xs">
                  <Row k="可用材料" v={p.material} />
                  <Row k="制作周期" v={p.eta} />
                  <Row k="参考价格" v={<span className="font-semibold text-primary">{p.price}</span>} />
                </dl>
                <button className="mt-5 w-full rounded-lg border border-border bg-background py-2 text-xs font-medium transition-colors hover:bg-secondary">
                  联系打印
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tool detail showcase */}
      <section id="detail" className="mx-auto max-w-6xl px-6 py-24">
        <SectionHead eyebrow="工具成果展示" title="一件辅助工具，是这样诞生的" desc="来自真实需求 · 经过开源建模 · 由社区共同打印交付。" />
        <div className="mt-12 grid grid-cols-1 gap-12 rounded-3xl border border-border bg-card p-6 md:p-10 lg:grid-cols-2">
          <div className="grid aspect-square place-items-center rounded-2xl bg-gradient-to-br from-[var(--sage-soft)] via-[var(--sand)] to-[var(--cream)] text-xs font-mono uppercase tracking-widest text-muted-foreground">
            成品照片 · 磁吸式延长开关
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex gap-1.5">
              <Tag>来源 #068</Tag>
              <Tag>开源共享</Tag>
              <Tag>支持打印购买</Tag>
            </div>
            <h3 className="mt-4 text-3xl font-bold leading-tight">磁吸式延长开关</h3>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              源于一位渐冻症用户的真实需求。磁吸结构吸附在原有翘板开关上，提供 15cm 受力臂，把按下开关需要的力量降低到原来的 1/8。可拆卸、可清洗、不破坏原装电器。
            </p>
            <dl className="mt-8 grid grid-cols-2 gap-4">
              <Metric k="开放程度" v="100% 开源" />
              <Metric k="打印成本" v="￥8.50 / PLA" />
              <Metric k="适用人群" v="握力 / 精细动作受限者" />
              <Metric k="是否可购买成品" v="是 · 由创客接单" />
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <button className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
                下载 STL 源文件
              </button>
              <button className="rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold hover:bg-secondary transition-colors">
                联系创客打印购买
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Flow */}
      <section id="flow" className="border-t border-border/60 bg-[var(--sand)]/30 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHead eyebrow="平台流程" title="从一个困扰，到手中的工具，仅需六步" />
          <ol className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-border md:grid-cols-3 lg:grid-cols-6">
            {flow.map((f) => (
              <li key={f.n} className="relative bg-background p-6">
                <span className="font-mono text-xs text-primary">{f.n}</span>
                <p className="mt-3 text-base font-bold">{f.t}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{f.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 className="text-balance text-3xl font-bold md:text-4xl">
          每一次「我也遇到这个问题」，都可能成为某个人的解答。
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          加入可及 —— 发布一条需求，分享一个方案，或为社区贡献一次打印。
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href="#post" className="rounded-2xl bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
            发布我的需求
          </a>
          <a href="#square" className="rounded-2xl bg-secondary px-7 py-3.5 text-sm font-semibold text-secondary-foreground hover:bg-[var(--sand)] transition-colors">
            浏览需求广场
          </a>
        </div>
      </section>

      <footer className="border-t border-border/60 bg-card/40">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-xs text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <span className="grid size-5 place-items-center rounded bg-primary text-[10px] font-bold text-primary-foreground">可</span>
            <span className="font-medium text-foreground">可及 · Accessibility Co-creation</span>
          </div>
          <p>© 2026 可及社区 · 让辅助工具回归真实需求 · 基于开源共创</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-primary">开源协议</a>
            <a href="#" className="hover:text-primary">隐私</a>
            <a href="#" className="hover:text-primary">联系我们</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-bold text-foreground">{n}</p>
      <p className="text-xs">{label}</p>
    </div>
  );
}

function SectionHead({
  eyebrow,
  title,
  desc,
  link,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
  link?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <span className="font-mono text-xs text-primary">{eyebrow}</span>
        <h2 className="mt-2 text-3xl font-bold md:text-4xl">{title}</h2>
        {desc && <p className="mt-3 text-muted-foreground">{desc}</p>}
      </div>
      {link && (
        <a href={link.href} className="text-sm font-medium text-primary underline-offset-4 hover:underline">
          {link.label}
        </a>
      )}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">
        {label} {required && <span className="text-primary">*</span>}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Tag({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        muted
          ? "bg-muted text-muted-foreground"
          : "bg-[var(--sage-soft)] text-[color-mix(in_oklab,var(--sage)_75%,black)]"
      }`}
    >
      {children}
    </span>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-right text-foreground">{v}</dd>
    </div>
  );
}

function Metric({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="text-[10px] font-mono uppercase text-muted-foreground">{k}</p>
      <p className="mt-1 text-sm font-semibold">{v}</p>
    </div>
  );
}
