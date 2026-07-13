"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const database_1 = require("../config/database");
const router = (0, express_1.Router)();
router.get('/qrcode', (_req, res) => {
    const state = Math.random().toString(36).substring(2, 15);
    const qrcodeUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=${process.env.WECHAT_APP_ID}&redirect_uri=http://localhost:5173/auth/callback&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`;
    res.json({ qrcodeUrl, state });
});
router.get('/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) {
        return res.status(400).json({ error: 'Missing code' });
    }
    const openid = `test_openid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const db = await (0, database_1.getDatabase)();
    const existingClient = await db.get('SELECT * FROM clients WHERE openid = ?', [openid]);
    let clientId = '';
    if (existingClient) {
        clientId = existingClient.id;
    }
    const token = jsonwebtoken_1.default.sign({ id: clientId, openid, role: 'client' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`http://localhost:5173/callback?token=${token}&openid=${openid}&hasProfile=${!!existingClient}`);
});
router.post('/client/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Missing username or password' });
    }
    const db = await (0, database_1.getDatabase)();
    const client = await db.get('SELECT * FROM clients WHERE username = ?', [username]);
    if (!client) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!client.password) {
        return res.status(401).json({ error: 'Account not set up for password login' });
    }
    const isPasswordValid = await bcrypt_1.default.compare(password, client.password);
    if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jsonwebtoken_1.default.sign({ id: client.id, openid: client.openid || '', role: 'client' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
        token,
        role: 'client',
        hasProfile: true,
        status: client.status
    });
});
router.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        const token = jsonwebtoken_1.default.sign({ id: 'admin', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, role: 'admin' });
    }
    else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});
exports.default = router;
