/**
 * OTP (One-Time Password) 实现 — 符合 RFC 4226 (HOTP) / RFC 6238 (TOTP)
 * 参考 Google Authenticator 开源版的算法与参数处理
 * 依赖 Web Crypto API 进行 HMAC 计算 (SHA1/SHA256/SHA512)
 */
(function (global) {
    'use strict';

    const DEFAULT_DIGITS = 6;
    const DEFAULT_PERIOD = 30;
    const DEFAULT_ALGORITHM = 'SHA1';
    const EPOCH = 0; // T0 = Unix epoch

    // 支持的算法到 Web Crypto hash 名称的映射
    const ALGORITHM_MAP = {
        'SHA1': 'SHA-1',
        'SHA256': 'SHA-256',
        'SHA512': 'SHA-512'
    };

    /**
     * 将整数转为 8 字节大端序缓冲 (用于 HOTP 计数器 / TOTP 时间计数器)
     * @param {number} counter
     * @returns {ArrayBuffer}
     */
    function counterToBuffer(counter) {
        const buf = new ArrayBuffer(8);
        const view = new DataView(buf);
        // JavaScript 安全整数范围支持到 2^53，OTP 计数器远低于此
        const high = Math.floor(counter / 0x100000000);
        const low = counter >>> 0;
        view.setUint32(0, high, false); // false = big-endian
        view.setUint32(4, low, false);
        return buf;
    }

    /**
     * 规范化算法名称 (大小写不敏感)，未识别时回退到 SHA1
     * @param {string} algo
     * @returns {string} 'SHA1' | 'SHA256' | 'SHA512'
     */
    function normalizeAlgorithm(algo) {
        if (!algo) return DEFAULT_ALGORITHM;
        const upper = String(algo).toUpperCase().replace('-', '');
        if (ALGORITHM_MAP[upper]) return upper;
        return DEFAULT_ALGORITHM;
    }

    /**
     * 使用 Web Crypto API 计算 HMAC
     * @param {Uint8Array} keyBytes - 密钥字节
     * @param {ArrayBuffer} data - 待计算数据
     * @param {string} algorithm - 'SHA1' | 'SHA256' | 'SHA512'
     * @returns {Promise<ArrayBuffer>}
     */
    async function hmac(keyBytes, data, algorithm) {
        const algoName = normalizeAlgorithm(algorithm);
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            keyBytes,
            { name: 'HMAC', hash: { name: ALGORITHM_MAP[algoName] } },
            false,
            ['sign']
        );
        return crypto.subtle.sign('HMAC', cryptoKey, data);
    }

    /**
     * 动态截取 (Dynamic Truncation)，RFC 4226
     * 与 Google Authenticator 的 PasscodeGenerator 一致：
     *   offset = hash[hash.length - 1] & 0x0F
     *   truncatedHash = (hash[offset..offset+4] & 0x7FFFFFFF)
     * @param {ArrayBuffer} hmacResult - HMAC 结果
     * @returns {number} 31 位无符号整数
     */
    function dynamicTruncate(hmacResult) {
        const bytes = new Uint8Array(hmacResult);
        const offset = bytes[bytes.length - 1] & 0x0f;
        const binCode =
            ((bytes[offset] & 0x7f) << 24) |
            ((bytes[offset + 1] & 0xff) << 16) |
            ((bytes[offset + 2] & 0xff) << 8) |
            (bytes[offset + 3] & 0xff);
        return binCode >>> 0; // 转为无符号
    }

    /**
     * 生成 HOTP (HMAC-based OTP)，RFC 4226
     * 与 Google Authenticator OTPGenerator.generateOTPForCounter 算法完全一致
     * @param {Uint8Array} keyBytes - 密钥字节
     * @param {number} counter - 计数器
     * @param {object} [options]
     * @param {number} [options.digits=6]
     * @param {string} [options.algorithm='SHA1']
     * @returns {Promise<string>}
     */
    async function hotp(keyBytes, counter, options) {
        options = options || {};
        const digits = options.digits || DEFAULT_DIGITS;
        const algorithm = normalizeAlgorithm(options.algorithm);
        const data = counterToBuffer(counter);
        const hmacResult = await hmac(keyBytes, data, algorithm);
        const truncated = dynamicTruncate(hmacResult);
        const code = (truncated % Math.pow(10, digits)).toString();
        return code.padStart(digits, '0');
    }

    /**
     * 生成当前时间的 TOTP (RFC 6238)
     * @param {Uint8Array} keyBytes - 密钥字节
     * @param {object} [options]
     * @param {number} [options.digits=6]
     * @param {number} [options.period=30]
     * @param {string} [options.algorithm='SHA1']
     * @param {number} [options.timestamp=Date.now()]
     * @returns {Promise<string>}
     */
    async function totp(keyBytes, options) {
        options = options || {};
        const digits = options.digits || DEFAULT_DIGITS;
        const period = options.period || DEFAULT_PERIOD;
        const algorithm = normalizeAlgorithm(options.algorithm);
        const timestamp = options.timestamp || Date.now();
        const counter = Math.floor((timestamp - EPOCH) / 1000 / period);
        return hotp(keyBytes, counter, { digits: digits, algorithm: algorithm });
    }

    /**
     * 计算当前周期剩余秒数
     * @param {number} period
     * @returns {number}
     */
    function remainingSeconds(period) {
        period = period || DEFAULT_PERIOD;
        return period - (Math.floor(Date.now() / 1000) % period);
    }

    /**
     * 构建 otpauth:// URI (用于二维码)
     * 兼容 Google Authenticator 的解析格式：
     *   otpauth://totp/<label>?secret=...&issuer=...&algorithm=...&digits=...&period=...
     *   otpauth://hotp/<label>?secret=...&counter=...&issuer=...&algorithm=...&digits=...
     * 当参数取默认值时省略，使 URI 与 Google Authenticator 生成的格式一致
     * @param {object} entry
     * @returns {string}
     */
    function buildOtpAuthUri(entry) {
        const digits = entry.digits || DEFAULT_DIGITS;
        const period = entry.period || DEFAULT_PERIOD;
        const algorithm = normalizeAlgorithm(entry.algorithm);
        const type = (entry.type || 'totp').toLowerCase();
        const issuer = entry.service || '';
        const account = entry.account || '';
        const label = issuer ? issuer + ':' + account : account;
        const labelEncoded = encodeURIComponent(label);
        const secret = encodeURIComponent(Base32.normalize(entry.secret || ''));

        const params = [];
        params.push('secret=' + secret);
        if (issuer) params.push('issuer=' + encodeURIComponent(issuer));
        // 仅在非默认时输出 algorithm/digits/period，与 Google Authenticator 行为一致
        if (algorithm !== DEFAULT_ALGORITHM) params.push('algorithm=' + algorithm);
        if (digits !== DEFAULT_DIGITS) params.push('digits=' + digits);
        if (type === 'totp' && period !== DEFAULT_PERIOD) {
            params.push('period=' + period);
        }
        if (type === 'hotp') {
            const counter = parseInt(entry.counter, 10);
            if (!isNaN(counter)) params.push('counter=' + counter);
        }
        return 'otpauth://' + type + '/' + labelEncoded + '?' + params.join('&');
    }

    /**
     * 解析 otpauth:// URI (用于从二维码或文本导入密钥)
     * 参考 Google Authenticator 的 OTPAuthURL.authURLWithURL 实现
     * @param {string} uri
     * @returns {object|null} 解析后的 entry，失败返回 null
     */
    function parseOtpAuthUri(uri) {
        if (typeof uri !== 'string') return null;
        const trimmed = uri.trim();
        if (!/^otpauth:\/\//i.test(trimmed)) return null;

        try {
            // 使用 URL 解析 (otpauth 不是标准 scheme，但 URL 仍能解析)
            const url = new URL(trimmed);
            const type = (url.host || '').toLowerCase();
            if (type !== 'totp' && type !== 'hotp') return null;

            // label = pathname 去掉前导 "/"
            let label = decodeURIComponent(url.pathname || '');
            if (label.charAt(0) === '/') label = label.slice(1);

            // 解析 label：issuer:account 或 account
            let service = '';
            let account = label;
            const colonIdx = label.indexOf(':');
            if (colonIdx >= 0) {
                service = label.slice(0, colonIdx).trim();
                account = label.slice(colonIdx + 1).trim();
            }

            // 解析 query
            const params = {};
            url.searchParams.forEach((value, key) => {
                params[key.toLowerCase()] = value;
            });

            const secret = params.secret ? Base32.normalize(params.secret) : '';
            if (!secret) return null;

            const entry = {
                type: type,
                service: service,
                account: account,
                secret: secret,
                algorithm: normalizeAlgorithm(params.algorithm),
                digits: parseInt(params.digits, 10) || DEFAULT_DIGITS,
                period: type === 'totp' ? (parseInt(params.period, 10) || DEFAULT_PERIOD) : DEFAULT_PERIOD,
                counter: type === 'hotp' ? (parseInt(params.counter, 10) || 0) : 0
            };
            // 限制 digits 在 6-8 之间 (与 Google Authenticator OTPGenerator 校验一致)
            if (entry.digits < 6) entry.digits = 6;
            if (entry.digits > 8) entry.digits = 8;
            // 限制 period 在 1-300 之间 (与 Google Authenticator TOTPGenerator 校验一致)
            if (entry.period < 1) entry.period = 1;
            if (entry.period > 300) entry.period = 300;
            return entry;
        } catch (e) {
            return null;
        }
    }

    global.OTP = {
        hotp: hotp,
        totp: totp,
        remainingSeconds: remainingSeconds,
        buildOtpAuthUri: buildOtpAuthUri,
        parseOtpAuthUri: parseOtpAuthUri,
        normalizeAlgorithm: normalizeAlgorithm,
        DEFAULT_DIGITS: DEFAULT_DIGITS,
        DEFAULT_PERIOD: DEFAULT_PERIOD,
        DEFAULT_ALGORITHM: DEFAULT_ALGORITHM,
        SUPPORTED_ALGORITHMS: Object.keys(ALGORITHM_MAP)
    };

    // 兼容旧 API (之前直接使用 TOTP.totp / TOTP.buildOtpAuthUri)
    global.TOTP = {
        hotp: hotp,
        totp: totp,
        remainingSeconds: remainingSeconds,
        buildOtpAuthUri: buildOtpAuthUri,
        parseOtpAuthUri: parseOtpAuthUri,
        normalizeAlgorithm: normalizeAlgorithm,
        DEFAULT_DIGITS: DEFAULT_DIGITS,
        DEFAULT_PERIOD: DEFAULT_PERIOD,
        DEFAULT_ALGORITHM: DEFAULT_ALGORITHM,
        SUPPORTED_ALGORITHMS: Object.keys(ALGORITHM_MAP)
    };
})(typeof window !== 'undefined' ? window : this);
