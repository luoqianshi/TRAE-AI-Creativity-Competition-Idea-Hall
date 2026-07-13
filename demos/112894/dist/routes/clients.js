"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const database_1 = require("../config/database");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/', async (req, res) => {
    const { openid, username, password, companyName, phone } = req.body;
    if (!companyName || !phone) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const db = await (0, database_1.getDatabase)();
    try {
        let existingClient = null;
        if (openid) {
            existingClient = await db.get('SELECT * FROM clients WHERE openid = ?', [openid]);
        }
        else if (username) {
            existingClient = await db.get('SELECT * FROM clients WHERE username = ?', [username]);
        }
        if (existingClient) {
            const updateFields = ['company_name = ?', 'phone = ?'];
            const updateValues = [companyName, phone];
            if (username) {
                updateFields.push('username = ?');
                updateValues.push(username);
            }
            if (password) {
                updateFields.push('password = ?');
                updateValues.push(await bcrypt_1.default.hash(password, 10));
            }
            updateFields.push('updated_at = CURRENT_TIMESTAMP');
            if (openid) {
                updateValues.push(openid);
                await db.run(`UPDATE clients SET ${updateFields.join(', ')} WHERE openid = ?`, updateValues);
            }
            else if (username) {
                updateValues.push(username);
                await db.run(`UPDATE clients SET ${updateFields.join(', ')} WHERE username = ?`, updateValues);
            }
            return res.json({ id: existingClient.id, status: existingClient.status });
        }
        const insertFields = ['company_name', 'phone'];
        const insertValues = [companyName, phone];
        if (openid) {
            insertFields.push('openid');
            insertValues.push(openid);
        }
        if (username) {
            insertFields.push('username');
            insertValues.push(username);
        }
        if (password) {
            insertFields.push('password');
            insertValues.push(await bcrypt_1.default.hash(password, 10));
        }
        const result = await db.run(`INSERT INTO clients (${insertFields.join(', ')}) VALUES (${insertFields.map(() => '?').join(', ')})`, insertValues);
        res.json({ id: result.lastID, status: 'pending' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to register client' });
    }
});
router.post('/create', auth_1.authenticateAdmin, async (req, res) => {
    const { username, password, companyName, phone } = req.body;
    if (!username || !password || !companyName || !phone) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const db = await (0, database_1.getDatabase)();
    try {
        const existingClient = await db.get('SELECT * FROM clients WHERE username = ?', [username]);
        if (existingClient) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const result = await db.run('INSERT INTO clients (username, password, company_name, phone, status) VALUES (?, ?, ?, ?, ?)', [username, hashedPassword, companyName, phone, 'approved']);
        res.json({ id: result.lastID, status: 'approved' });
    }
    catch (error) {
        console.error('Create client error:', error);
        res.status(500).json({ error: 'Failed to create client' });
    }
});
router.put('/:id/password', auth_1.authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;
    if (!password) {
        return res.status(400).json({ error: 'Missing password' });
    }
    const db = await (0, database_1.getDatabase)();
    try {
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        await db.run('UPDATE clients SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [hashedPassword, id]);
        res.json({ success: true });
    }
    catch {
        res.status(500).json({ error: 'Failed to reset password' });
    }
});
router.get('/', auth_1.authenticateAdmin, async (req, res) => {
    const { status } = req.query;
    const db = await (0, database_1.getDatabase)();
    let query = 'SELECT id, username, company_name, phone, status, created_at, updated_at FROM clients ORDER BY created_at DESC';
    const params = [];
    if (status) {
        query += ' WHERE status = ?';
        params.push(status);
    }
    const clients = await db.all(query, params);
    res.json({ clients });
});
router.put('/:id/status', auth_1.authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    const db = await (0, database_1.getDatabase)();
    try {
        await db.run('UPDATE clients SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);
        res.json({ success: true });
    }
    catch {
        res.status(500).json({ error: 'Failed to update status' });
    }
});
router.delete('/:id', auth_1.authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    const db = await (0, database_1.getDatabase)();
    try {
        await db.run('DELETE FROM clients WHERE id = ?', [id]);
        res.json({ success: true });
    }
    catch {
        res.status(500).json({ error: 'Failed to delete client' });
    }
});
router.get('/me', auth_1.authenticateClient, async (req, res) => {
    const user = req.user;
    const db = await (0, database_1.getDatabase)();
    let client = null;
    if (user.openid) {
        client = await db.get('SELECT * FROM clients WHERE openid = ?', [user.openid]);
    }
    if (!client && user.id) {
        client = await db.get('SELECT * FROM clients WHERE id = ?', [user.id]);
    }
    if (!client) {
        return res.status(404).json({ error: 'Client not found' });
    }
    res.json({
        id: client.id,
        companyName: client.company_name,
        phone: client.phone,
        status: client.status,
        createdAt: client.created_at
    });
});
exports.default = router;
