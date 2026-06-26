/**
 * Base32 编解码工具 (RFC 4648, 无填充)
 * 用于 2FA 密钥的编码与解码
 */
(function (global) {
    'use strict';

    // RFC 4648 Base32 字母表 (A-Z, 2-7)
    const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

    // 旧版 Google Authenticator 使用的 Base32 字母表
    // (排除 0, 1, O, I 以避免混淆，与 Base32Legacy.java 一致)
    const LEGACY_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

    // 标准字母表 -> 值
    const CHAR_MAP = (function () {
        const map = {};
        for (let i = 0; i < ALPHABET.length; i++) {
            map[ALPHABET.charAt(i)] = i;
        }
        return map;
    })();

    // legacy 字母表 -> 值 (仅在标准解码失败时回退使用)
    const LEGACY_CHAR_MAP = (function () {
        const map = {};
        for (let i = 0; i < LEGACY_ALPHABET.length; i++) {
            map[LEGACY_ALPHABET.charAt(i)] = i;
        }
        return map;
    })();

    /**
     * 规范化 Base32 字符串：转大写、移除空格和分隔符、去除填充符 "="
     * 参考 Google Authenticator 的 Base32String：忽略空格、'-' 分隔符，并允许小写
     * @param {string} str
     * @returns {string}
     */
    function normalize(str) {
        if (typeof str !== 'string') return '';
        return str
            .toUpperCase()
            .replace(/[\s\-_]/g, '')   // 去除空格和常见分隔符
            .replace(/=+$/g, '');       // 去除尾部填充
    }

    /**
     * 内部：用给定字符表解码
     * @param {string} clean - 已规范化的字符串
     * @param {object} map - 字符->值映射
     * @returns {Uint8Array|null} 解码失败返回 null
     */
    function decodeWithMap(clean, map) {
        // 校验合法性
        for (let i = 0; i < clean.length; i++) {
            if (!(clean.charAt(i) in map)) return null;
        }
        const bits = [];
        for (let i = 0; i < clean.length; i++) {
            const v = map[clean.charAt(i)];
            for (let j = 4; j >= 0; j--) {
                bits.push((v >> j) & 1);
            }
        }
        // 每 8 位组成一个字节
        const byteCount = Math.floor(bits.length / 8);
        const out = new Uint8Array(byteCount);
        for (let i = 0; i < byteCount; i++) {
            let b = 0;
            for (let j = 0; j < 8; j++) {
                b = (b << 1) | bits[i * 8 + j];
            }
            out[i] = b;
        }
        return out;
    }

    /**
     * 将 Base32 字符串解码为 Uint8Array 字节
     * 兼容 RFC 4648 标准字母表，以及旧版 Google Authenticator 的 legacy 字母表
     * (Base32Legacy: 排除 0/1/O/I，与 Base32Legacy.java 一致)
     * @param {string} input - Base32 字符串
     * @returns {Uint8Array} 解码后的字节
     * @throws {Error} 当输入包含非法字符时抛出
     */
    function decode(input) {
        const clean = normalize(input);
        if (clean.length === 0) return new Uint8Array(0);

        // 优先用标准 RFC 4648 字母表
        let out = decodeWithMap(clean, CHAR_MAP);
        if (out) return out;

        // 回退到 legacy 字母表 (旧 Google 账户)
        out = decodeWithMap(clean, LEGACY_CHAR_MAP);
        if (out) return out;

        // 仍失败：报告非法字符 (列出第一个非法字符)
        for (let i = 0; i < clean.length; i++) {
            if (!(clean.charAt(i) in CHAR_MAP) && !(clean.charAt(i) in LEGACY_CHAR_MAP)) {
                throw new Error('Base32 解码失败：包含非法字符 "' + clean.charAt(i) + '"');
            }
        }
        throw new Error('Base32 解码失败');
    }

    /**
     * 将 Uint8Array 字节编码为 Base32 字符串 (无填充)
     * @param {Uint8Array} bytes
     * @returns {string}
     */
    function encode(bytes) {
        if (!(bytes instanceof Uint8Array)) {
            bytes = new Uint8Array(bytes || []);
        }
        if (bytes.length === 0) return '';

        const bits = [];
        for (let i = 0; i < bytes.length; i++) {
            for (let j = 7; j >= 0; j--) {
                bits.push((bytes[i] >> j) & 1);
            }
        }

        let out = '';
        for (let i = 0; i < bits.length; i += 5) {
            let v = 0;
            for (let j = 0; j < 5; j++) {
                v = (v << 1) | (i + j < bits.length ? bits[i + j] : 0);
            }
            out += ALPHABET.charAt(v & 0x1f);
        }
        return out;
    }

    /**
     * 生成指定长度的随机密钥字节，并返回 Base32 字符串
     * @param {number} byteLength - 默认 20 字节 (160 位，与 SHA1 一致)
     * @returns {string} Base32 编码的密钥
     */
    function generateSecret(byteLength) {
        byteLength = byteLength || 20;
        const bytes = new Uint8Array(byteLength);
        (global.crypto || global.msCrypto).getRandomValues(bytes);
        return encode(bytes);
    }

    global.Base32 = {
        encode: encode,
        decode: decode,
        normalize: normalize,
        generateSecret: generateSecret,
        ALPHABET: ALPHABET,
        LEGACY_ALPHABET: LEGACY_ALPHABET
    };
})(typeof window !== 'undefined' ? window : this);
