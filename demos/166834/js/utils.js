/**
 * 工具函数模块
 * 提供日期解析、格式化、数值提取、XML 转义等通用工具
 */

/**
 * 解析日期字符串为 Date 对象
 * 支持多种格式：YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD, YYYYMMDD, YYYY-M-D, MM-DD/M-D(无年份默认今年)
 * @param {string} str - 日期字符串
 * @returns {Date|null} 解析成功返回 Date，失败返回 null
 */
function parseDate(str) {
    if (!str) return null;
    var s = String(str).trim();
    if (!s) return null;
    var currentYear = new Date().getFullYear();
    var d, year, month, day;

    // 8 位纯数字：YYYYMMDD（以 19 或 20 开头视为年份）
    var m8 = s.match(/^((?:19|20)\d{2})(\d{2})(\d{2})$/);
    if (m8) {
        year = parseInt(m8[1], 10); month = parseInt(m8[2], 10) - 1; day = parseInt(m8[3], 10);
        d = new Date(year, month, day);
        if (d.getFullYear() === year && d.getMonth() === month && d.getDate() === day) return d;
    }

    // YYYY 分隔 MM 分隔 DD（支持 - / . 分隔，月日可不补零）
    var mFull = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    if (mFull) {
        year = parseInt(mFull[1], 10); month = parseInt(mFull[2], 10) - 1; day = parseInt(mFull[3], 10);
        d = new Date(year, month, day);
        if (d.getFullYear() === year && d.getMonth() === month && d.getDate() === day) return d;
    }

    // MM-DD 或 M-D（无年份，默认今年）
    var mShort = s.match(/^(\d{1,2})[-/.](\d{1,2})$/);
    if (mShort) {
        month = parseInt(mShort[1], 10) - 1; day = parseInt(mShort[2], 10);
        if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
            year = currentYear;
            d = new Date(year, month, day);
            if (d.getMonth() === month && d.getDate() === day) return d;
        }
    }

    return null;
}

/**
 * 将任意格式的日期字符串归一化为 YYYY-MM-DD
 * 解析失败时返回原字符串（供序数模式等场景保留原值）
 * @param {string} str - 原始日期字符串
 * @returns {string} 归一化后的 YYYY-MM-DD 字符串，或原字符串
 */
function normalizeDateStr(str) {
    if (!str) return '';
    var d = parseDate(str);
    if (d) return formatDate(d);
    return String(str).trim();
}

/**
 * 格式化 Date 对象为 YYYY-MM-DD 字符串
 * @param {Date} d - 日期对象
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(d) {
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
}

/**
 * 判断是否为有效 Date 对象
 * @param {*} d - 待判断的值
 * @returns {boolean}
 */
function isValidDate(d) { return d instanceof Date && !isNaN(d); }

/**
 * 计算两个日期之间的天数差
 * @param {Date} d1 - 起始日期
 * @param {Date} d2 - 结束日期
 * @returns {number} 天数差（d2 - d1）
 */
function daysBetween(d1, d2) {
    var t1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
    var t2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
    return Math.round((t2 - t1) / (24 * 60 * 60 * 1000));
}

/**
 * 从字符串中提取第一个数字
 * @param {string} str - 输入字符串
 * @returns {number|null} 提取到的数字，无则返回 null
 */
function extractNumber(str) {
    if (!str) return null;
    var m = String(str).trim().match(/(\d+)/);
    return m ? parseInt(m[1], 10) : null;
}

/**
 * XML 转义，防止 SVG 中注入特殊字符
 * @param {string} str - 原始字符串
 * @returns {string} 转义后的字符串
 */
function escapeXml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
