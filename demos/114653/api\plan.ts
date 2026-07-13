interface PlanRequest { ingredients?: string[] }

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 })
  const body = await request.json() as PlanRequest
  const selected = (body.ingredients ?? []).filter((item) => typeof item === 'string').slice(0, 30)
  const fallback = {
    source: 'mock',
    selected,
    menus: [
      { day: 1, name: '香煎三文鱼配番茄菠菜沙拉' },
      { day: 2, name: '口蘑鸡肉烩饭' },
      { day: 3, name: '蓝莓蛋奶早餐' },
    ],
    seasonings: ['黑胡椒', '迷迭香', '橄榄油'],
  }

  const apiKey = process.env.LLM_API_KEY
  if (!apiKey || selected.length === 0) return Response.json(fallback)

  const response = await fetch(process.env.LLM_BASE_URL ?? 'https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: process.env.LLM_MODEL ?? 'glm-4.5-flash',
      temperature: 0.5,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: '你是家庭食材管理助手。只返回 JSON，包含 menus、seasonings、storageTips 三个字段。菜单覆盖未来三天，优先消耗临期食材。' },
        { role: 'user', content: `现有食材：${selected.join('、')}` },
      ],
    }),
  })

  if (!response.ok) return Response.json(fallback)
  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
  const content = data.choices?.[0]?.message?.content
  if (!content) return Response.json(fallback)
  try { return Response.json({ source: 'ai', selected, ...JSON.parse(content) as object }) }
  catch { return Response.json(fallback) }
}
