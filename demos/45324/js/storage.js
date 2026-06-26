/**
 * 存储层：基于 localStorage 的密钥管理，支持可选的 AES-GCM 加密
 * 加密流程：主密码 --PBKDF2--> AES-GCM 密钥 --> 加密密钥列表
 */
(function (global) {
    'use strict';

    const STORAGE_KEY = 'twofa.keys.v1';
    const META_KEY = 'twofa.meta.v1';
    const SALT_KEY = 'twofa.salt.v1';

    const PBKDF2_ITERATIONS = 150000; // 强度
    const SALT_LENGTH = 16; // 字节
    const IV_LENGTH = 12;  // 字节 (AES-GCM 推荐 96 位)

    /**
     * 元数据结构：
     * { encrypted: bool, passwordHash: string|null, version: string }
     */

    /**
     * 读取元数据
     * @returns {object}
     */
    function getMeta() {
        try {
            const raw = localStorage.getItem(META_KEY);
            return raw ? JSON.parse(raw) : { encrypted: false, passwordHash: null, version: '1' };
        } catch (e) {
            return { encrypted: false, passwordHash: null, version: '1' };
        }
    }

    /**
     * 写入元数据
     * @param {object} meta
     */
    function setMeta(meta) {
        localStorage.setItem(META_KEY, JSON.stringify(meta));
    }

    /**
     * 是否启用加密
     */
    function isEncrypted() {
        return getMeta().encrypted === true;
    }

    /**
     * 获取或创建盐值
     * @returns {Uint8Array}
     */
    function getSalt() {
        let raw = localStorage.getItem(SALT_KEY);
        if (!raw) {
            const salt = new Uint8Array(SALT_LENGTH);
            crypto.getRandomValues(salt);
            raw = uint8ToBase64(salt);
            localStorage.setItem(SALT_KEY, raw);
            return salt;
        }
        return base64ToUint8(raw);
    }

    /**
     * 通过主密码派生 AES-GCM CryptoKey
     * @param {string} password
     * @param {Uint8Array} [salt]
     * @returns {Promise<CryptoKey>}
     */
    async function deriveKey(password, salt) {
        if (!salt) salt = getSalt();
        const enc = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            enc.encode(password),
            { name: 'PBKDF2' },
            false,
            ['deriveKey']
        );
        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: PBKDF2_ITERATIONS,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * AES-GCM 加密
     * @param {CryptoKey} key
     * @param {string} plaintext
     * @returns {Promise<string>} base64(IV || ciphertext)
     */
    async function encryptString(key, plaintext) {
        const iv = new Uint8Array(IV_LENGTH);
        crypto.getRandomValues(iv);
        const enc = new TextEncoder();
        const cipherBuf = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            enc.encode(plaintext)
        );
        const combined = new Uint8Array(iv.length + cipherBuf.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(cipherBuf), iv.length);
        return uint8ToBase64(combined);
    }

    /**
     * AES-GCM 解密
     * @param {CryptoKey} key
     * @param {string} payload - base64(IV || ciphertext)
     * @returns {Promise<string>} plaintext
     */
    async function decryptString(key, payload) {
        const data = base64ToUint8(payload);
        const iv = data.slice(0, IV_LENGTH);
        const cipher = data.slice(IV_LENGTH);
        const dec = new TextDecoder();
        const plainBuf = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            cipher
        );
        return dec.decode(plainBuf);
    }

    /**
     * 简单的密码哈希校验 (用于判断密码是否正确，非加密存储用)
     * 使用 PBKDF2 + SHA-256
     * @param {string} password
     * @returns {Promise<string>}
     */
    async function hashPassword(password) {
        const salt = getSalt();
        const enc = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            enc.encode(password),
            { name: 'PBKDF2' },
            false,
            ['deriveBits']
        );
        const bits = await crypto.subtle.deriveBits(
            { name: 'PBKDF2', salt: salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
            keyMaterial,
            256
        );
        return uint8ToBase64(new Uint8Array(bits));
    }

    /**
     * 保存密钥列表 (根据是否启用加密选择方式)
     * @param {Array} keys
     * @param {CryptoKey} [cryptoKey] - 启用加密时必须提供
     */
    async function saveKeys(keys, cryptoKey) {
        const json = JSON.stringify(keys || []);
        const meta = getMeta();
        if (meta.encrypted) {
            if (!cryptoKey) throw new Error('加密模式需要提供 CryptoKey');
            const payload = await encryptString(cryptoKey, json);
            localStorage.setItem(STORAGE_KEY, payload);
        } else {
            localStorage.setItem(STORAGE_KEY, json);
        }
    }

    /**
     * 读取密钥列表
     * @param {CryptoKey} [cryptoKey] - 启用加密时必须提供
     * @returns {Promise<Array>}
     */
    async function loadKeys(cryptoKey) {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const meta = getMeta();
        if (meta.encrypted) {
            if (!cryptoKey) throw new Error('加密模式需要提供 CryptoKey');
            try {
                const plain = await decryptString(cryptoKey, raw);
                return JSON.parse(plain);
            } catch (e) {
                throw new Error('解密失败：密码错误或数据损坏');
            }
        }
        try {
            return JSON.parse(raw);
        } catch (e) {
            return [];
        }
    }

    /**
     * 启用密码保护：使用旧密码 (若有) 解密现有数据，再用新密码加密
     * @param {string} newPassword
     * @param {string} [oldPassword] - 之前已设置密码时需要
     * @returns {Promise<CryptoKey>} 新密码派生的 CryptoKey
     */
    async function enableEncryption(newPassword, oldPassword) {
        const meta = getMeta();
        let currentKeys = [];

        if (meta.encrypted && meta.passwordHash) {
            // 已启用加密，需要旧密码先解锁
            if (!oldPassword) throw new Error('修改密码需要原密码');
            const oldHash = await hashPassword(oldPassword);
            if (oldHash !== meta.passwordHash) {
                throw new Error('原密码不正确');
            }
            const oldKey = await deriveKey(oldPassword);
            currentKeys = await loadKeys(oldKey);
        } else {
            currentKeys = await loadKeys();
        }

        // 设置新密码
        const newKey = await deriveKey(newPassword);
        const newHash = await hashPassword(newPassword);
        await saveKeys(currentKeys, newKey);
        setMeta({ encrypted: true, passwordHash: newHash, version: '1' });
        return newKey;
    }

    /**
     * 关闭密码保护：解密现有数据并以明文存储
     * @param {string} password - 当前密码
     * @returns {Promise<void>}
     */
    async function disableEncryption(password) {
        const meta = getMeta();
        if (!meta.encrypted) return;
        if (!password) throw new Error('请输入当前密码');
        const hash = await hashPassword(password);
        if (hash !== meta.passwordHash) throw new Error('密码不正确');
        const key = await deriveKey(password);
        const keys = await loadKeys(key);
        localStorage.removeItem(STORAGE_KEY);
        await saveKeys(keys); // 明文存储
        setMeta({ encrypted: false, passwordHash: null, version: '1' });
    }

    /**
     * 校验密码并返回 CryptoKey (用于解锁)
     * @param {string} password
     * @returns {Promise<CryptoKey|null>} 启用加密时返回 CryptoKey，否则返回 null
     */
    async function unlock(password) {
        const meta = getMeta();
        if (!meta.encrypted) return null;
        const hash = await hashPassword(password);
        if (hash !== meta.passwordHash) throw new Error('密码不正确');
        return deriveKey(password);
    }

    /**
     * 完全清除所有本地数据 (忘记密码时使用)
     */
    function wipeAll() {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(META_KEY);
        localStorage.removeItem(SALT_KEY);
    }

    // ===== Base64 工具 (处理 Uint8Array 与字符串互转) =====

    function uint8ToBase64(bytes) {
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    function base64ToUint8(b64) {
        const binary = atob(b64);
        const out = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            out[i] = binary.charCodeAt(i);
        }
        return out;
    }

    global.Storage = {
        loadKeys: loadKeys,
        saveKeys: saveKeys,
        isEncrypted: isEncrypted,
        getMeta: getMeta,
        setMeta: setMeta,
        unlock: unlock,
        enableEncryption: enableEncryption,
        disableEncryption: disableEncryption,
        wipeAll: wipeAll,
        hashPassword: hashPassword
    };
})(typeof window !== 'undefined' ? window : this);
