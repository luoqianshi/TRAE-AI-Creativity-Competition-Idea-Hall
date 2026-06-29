import { request } from '../api.js'

function normalizePrintArea(raw = {}) {
	return {
		width: Number(raw.width || 0),
		height: Number(raw.height || 0),
		shape: raw.shape || 'rect',
		label: raw.label || '',
	}
}

function normalizeProduct(item = {}) {
	return {
		id: Number(item.id || 0),
		name: item.name || '',
		emoji: item.emoji || '🛍️',
		price: Number(item.price || 0),
		desc: item.desc || '',
		status: item.status || '',
		printArea: normalizePrintArea(item.print_area || item.printArea || {}),
		kind: item.kind || 'physical',
		isVipDemo: (item.kind || '') === 'vip_demo',
	}
}

function normalizeDesign(raw) {
	if (!raw || !raw.image_path) return null
	return {
		imagePath: raw.image_path,
		x: Number(raw.x || 0),
		y: Number(raw.y || 0),
		scale: Number(raw.scale || 1),
	}
}

function normalizeCartItem(item = {}) {
	return {
		cartId: Number(item.id || 0),
		productId: Number(item.product_id || 0),
		name: item.name || '',
		emoji: item.emoji || '🛍️',
		price: Number(item.price || 0),
		desc: item.desc || '',
		status: item.status || '',
		printArea: normalizePrintArea(item.print_area || {}),
		qty: Number(item.quantity || 1),
		design: normalizeDesign(item.design),
		lineTotal: Number(item.line_total || 0),
		kind: item.kind || 'physical',
		isVipDemo: (item.kind || '') === 'vip_demo',
	}
}

function normalizeCart(payload = {}) {
	const items = Array.isArray(payload.items) ? payload.items.map(normalizeCartItem) : []
	return {
		items,
		totalQuantity: Number(payload.total_quantity || 0),
		totalAmount: Number(payload.total_amount || 0),
		currency: payload.currency || 'CNY',
	}
}

function toDesignPayload(design) {
	if (!design || !design.imagePath) return null
	return {
		image_path: design.imagePath,
		x: Number(design.x || 0),
		y: Number(design.y || 0),
		scale: Number(design.scale || 1),
	}
}

export async function getProducts() {
	const res = await request({ url: '/products', method: 'GET' })
	const items = Array.isArray(res.items) ? res.items : []
	return items.map(normalizeProduct)
}

export async function getCart() {
	const res = await request({ url: '/cart', method: 'GET', auth: true })
	return normalizeCart(res)
}

export async function addCartItem(payload) {
	const res = await request({
		url: '/cart/items',
		method: 'POST',
		auth: true,
		data: {
			product_id: payload.productId,
			quantity: payload.quantity || 1,
			design: toDesignPayload(payload.design),
		},
	})
	return normalizeCart(res)
}

export async function updateCartItem(itemId, payload = {}) {
	const body = {}
	if (Object.prototype.hasOwnProperty.call(payload, 'quantity')) {
		body.quantity = payload.quantity
	}
	if (Object.prototype.hasOwnProperty.call(payload, 'design')) {
		body.design = toDesignPayload(payload.design)
	}
	const res = await request({
		url: `/cart/items/${itemId}`,
		method: 'PATCH',
		auth: true,
		data: body,
	})
	return normalizeCart(res)
}

export async function deleteCartItem(itemId) {
	const res = await request({
		url: `/cart/items/${itemId}`,
		method: 'DELETE',
		auth: true,
	})
	return normalizeCart(res)
}

export async function clearCart() {
	await request({
		url: '/cart',
		method: 'DELETE',
		auth: true,
	})
	return {
		items: [],
		totalQuantity: 0,
		totalAmount: 0,
		currency: 'CNY',
	}
}
