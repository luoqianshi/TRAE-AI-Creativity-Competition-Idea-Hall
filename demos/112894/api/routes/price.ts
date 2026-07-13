import { Router, Request, Response } from 'express'
import { getDatabase } from '../config/database'
import { authenticateClient, authenticateAdmin, AuthRequest } from '../middleware/auth'

const router = Router()

router.post('/calculate', authenticateClient, async (req: Request, res: Response) => {
  const body = req.body as { length: number; width: number; height: number; quantity: number }
  const { length, width, height, quantity } = body
  
  if (!length || !width || !height || !quantity) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  
  const db = await getDatabase()
  const params = await db.get('SELECT * FROM price_parameters LIMIT 1')
  
  if (!params) {
    return res.status(500).json({ error: 'Price parameters not found' })
  }
  
  const area = 2 * (length * width + length * height + width * height) / 10000
  const materialWeight = area * 80 / 1000000
  const materialCost = materialWeight * params.raw_material_price
  const markup = materialCost * params.markup_ratio
  const wasteCost = params.waste_cost
  const shippingCost = params.shipping_cost / Math.max(quantity, 1)
  
  const unitPrice = materialCost + markup + wasteCost + shippingCost
  const totalPrice = unitPrice * quantity
  
  await db.run(
    'INSERT INTO orders (client_id, length, width, height, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [(req as AuthRequest).user!.id, length, width, height, quantity, unitPrice, totalPrice]
  )
  
  res.json({
    unitPrice: parseFloat(unitPrice.toFixed(2)),
    totalPrice: parseFloat(totalPrice.toFixed(2)),
    breakdown: {
      materialCost: parseFloat(materialCost.toFixed(2)),
      markup: parseFloat(markup.toFixed(2)),
      wasteCost: parseFloat(wasteCost.toFixed(2)),
      shippingCost: parseFloat(shippingCost.toFixed(2))
    }
  })
})

router.get('/parameters', async (_req: Request, res: Response) => {
  const db = await getDatabase()
  const params = await db.get('SELECT * FROM price_parameters LIMIT 1')
  
  if (!params) {
    return res.status(500).json({ error: 'Price parameters not found' })
  }
  
  res.json({
    rawMaterialPrice: params.raw_material_price,
    markupRatio: params.markup_ratio,
    wasteCost: params.waste_cost,
    shippingCost: params.shipping_cost,
    updatedAt: params.updated_at
  })
})

router.put('/parameters', authenticateAdmin, async (req: Request, res: Response) => {
  const body = req.body as {
    rawMaterialPrice?: number
    markupRatio?: number
    wasteCost?: number
    shippingCost?: number
  }
  const { rawMaterialPrice, markupRatio, wasteCost, shippingCost } = body
  
  const db = await getDatabase()
  const existingParams = await db.get('SELECT * FROM price_parameters LIMIT 1')
  
  if (!existingParams) {
    return res.status(500).json({ error: 'Price parameters not found' })
  }
  
  await db.run(
    'INSERT INTO price_history (parameter_id, raw_material_price, markup_ratio, waste_cost, shipping_cost) VALUES (?, ?, ?, ?, ?)',
    [
      existingParams.id,
      existingParams.raw_material_price,
      existingParams.markup_ratio,
      existingParams.waste_cost,
      existingParams.shipping_cost
    ]
  )
  
  const updates: string[] = []
  const values: unknown[] = []
  
  if (rawMaterialPrice !== undefined) {
    updates.push('raw_material_price = ?')
    values.push(rawMaterialPrice)
  }
  if (markupRatio !== undefined) {
    updates.push('markup_ratio = ?')
    values.push(markupRatio)
  }
  if (wasteCost !== undefined) {
    updates.push('waste_cost = ?')
    values.push(wasteCost)
  }
  if (shippingCost !== undefined) {
    updates.push('shipping_cost = ?')
    values.push(shippingCost)
  }
  
  if (updates.length > 0) {
    updates.push('updated_at = CURRENT_TIMESTAMP')
    values.push(existingParams.id)
    
    await db.run(
      `UPDATE price_parameters SET ${updates.join(', ')} WHERE id = ?`,
      values
    )
  }
  
  res.json({ success: true })
})

export default router