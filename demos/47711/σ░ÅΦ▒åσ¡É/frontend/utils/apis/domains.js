import { createDomainApi } from './base.js'

export const authApi = createDomainApi('/auth')
export const userApi = createDomainApi('/user', { auth: true })
export const ocApi = createDomainApi('/oc', { auth: true })
export const chatApi = createDomainApi('/chat', { auth: true })
export const forumApi = createDomainApi('/forum')
export const activityApi = createDomainApi('/activity')
export const commissionApi = createDomainApi('/commission', { auth: true })
export const shopApi = createDomainApi('/shop')
export const generateApi = createDomainApi('/generate', { auth: true })
export const fileApi = createDomainApi('/file', { auth: true })
