import { request } from '../api.js'

function normalizePrintArea(raw = {}) {
	return {
		width: Number(raw.width || 0),
		height: Number(raw.height || 0),
		shape: raw.shape || 'rect',
		label: raw.label || '',
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

function normalizeOrderItem(item = {}) {
	return {
		id: Number(item.id || 0),
		productId: item.product_id == null ? null : Number(item.product_id),
		name: item.name || '',
		emoji: item.emoji || '🛍️',
		desc: item.desc || '',
		status: item.status || '',
		printArea: normalizePrintArea(item.print_area || {}),
		qty: Number(item.quantity || 0),
		unitPrice: Number(item.unit_price || 0),
		lineTotal: Number(item.line_total || 0),
		design: normalizeDesign(item.design),
		kind: item.kind || 'physical',
	}
}

function normalizeOrder(order = {}) {
	return {
		id: Number(order.id || 0),
		orderNo: order.order_no || '',
		userId: Number(order.user_id || 0),
		status: order.status || '',
		paymentStatus: order.payment_status || '',
		paymentChannel: order.payment_channel || '',
		paymentProvider: order.payment_provider || '',
		paymentReference: order.payment_reference || '',
		paymentPayload: order.payment_payload || {},
		currency: order.currency || 'CNY',
		subtotalAmount: Number(order.subtotal_amount || 0),
		discountAmount: Number(order.discount_amount || 0),
		totalAmount: Number(order.total_amount || 0),
		totalQuantity: Number(order.total_quantity || 0),
		paidAmount: Number(order.paid_amount || 0),
		paidAt: order.paid_at || '',
		note: order.note || '',
		createdAt: order.created_at || '',
		updatedAt: order.updated_at || '',
		items: Array.isArray(order.items) ? order.items.map(normalizeOrderItem) : [],
	}
}

export async function createOrder(payload = {}) {
	const res = await request({
		url: '/orders',
		method: 'POST',
		auth: true,
		data: {
			source: payload.source || 'cart',
			note: payload.note || '',
		},
	})
	return normalizeOrder(res)
}

export async function getOrders() {
	const res = await request({
		url: '/orders',
		method: 'GET',
		auth: true,
	})
	const items = Array.isArray(res.items) ? res.items : []
	return items.map(normalizeOrder)
}

export async function getOrderDetail(orderId) {
	const res = await request({
		url: `/orders/${orderId}`,
		method: 'GET',
		auth: true,
	})
	return normalizeOrder(res)
}

export async function payOrderDemo(orderId, payload = {}) {
	const res = await request({
		url: `/orders/${orderId}/pay-demo`,
		method: 'PATCH',
		auth: true,
		data: {
			action: payload.action || 'start',
			payment_provider: payload.paymentProvider || 'demo-gateway',
			callback_payload: payload.callbackPayload || null,
		},
	})
	return normalizeOrder(res)
}

export async function getRevenueDashboard() {
	const res = await request({
		url: '/me/revenue-dashboard',
		method: 'GET',
		auth: true,
	})
	return {
		currency: res.currency || 'CNY',
		totalRevenue: Number(res.total_revenue || 0),
		monthRevenue: Number(res.month_revenue || 0),
		pendingWithdraw: Number(res.pending_withdraw || 0),
		availableWithdraw: Number(res.available_withdraw || 0),
		paidOrdersCount: Number(res.paid_orders_count || 0),
		withdrawnTotal: Number(res.withdrawn_total || 0),
		lastPaidAt: res.last_paid_at || '',
		lastWithdrawRequestedAt: res.last_withdraw_requested_at || '',
	}
}
