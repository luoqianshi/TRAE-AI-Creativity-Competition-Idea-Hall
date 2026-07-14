import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 数字转中文大写金额（财务规范）
const digitMap = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"]
const unitMap = ["", "拾", "佰", "仟"]
const bigUnitMap = ["", "万", "亿", "万亿"]

/**
 * 将金额数字转为中文大写金额字符串。
 * 例：1288.5 → "壹仟贰佰捌拾捌元伍角"
 *     3600   → "叁仟陆佰元整"
 */
export function toChineseAmount(num: number): string {
  if (isNaN(num) || num === 0) return "零元整"
  if (num < 0) return "负" + toChineseAmount(-num)

  // 拆分整数与小数部分
  const rounded = Math.round(num * 100) / 100
  const intPart = Math.floor(rounded)
  const decimalPart = Math.round((rounded - intPart) * 100)

  const jiao = Math.floor(decimalPart / 10)
  const fen = decimalPart % 10

  // 整数部分转中文
  let intStr = ""
  if (intPart === 0) {
    intStr = ""
  } else {
    intStr = convertInt(intPart)
    intStr += "元"
  }

  // 小数部分
  let decStr = ""
  if (jiao === 0 && fen === 0) {
    decStr = "整"
  } else {
    if (jiao > 0) {
      decStr += digitMap[jiao] + "角"
    } else if (fen > 0 && intPart > 0) {
      decStr += "零"
    }
    if (fen > 0) {
      decStr += digitMap[fen] + "分"
    }
  }

  // 处理 0.xx 元情况（整数部分为 0）
  if (intPart === 0) {
    return decStr
  }

  return intStr + decStr
}

// 转换整数部分（4 位一组）
function convertInt(num: number): string {
  if (num === 0) return digitMap[0]

  const groups: number[] = []
  let n = num
  while (n > 0) {
    groups.push(n % 10000)
    n = Math.floor(n / 10000)
  }

  let result = ""
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i]
    if (g === 0) {
      // 整组为零，补一个零（后续会去重）
      if (result && !result.endsWith("零")) {
        result += "零"
      }
    } else {
      const groupStr = convertGroup(g)
      result += groupStr + bigUnitMap[i]
      // 组间补零判断：若本组不足千位且前组有值，需补零
      if (i > 0 && g < 1000 && g > 0 && !result.endsWith("零")) {
        result += "零"
      }
    }
  }

  // 去除末尾多余的零
  result = result.replace(/零+$/, "")
  // 合并连续零为单个零
  result = result.replace(/零+/g, "零")

  return result
}

// 转换 4 位以内数字
function convertGroup(num: number): string {
  if (num === 0) return ""
  let str = ""
  const qian = Math.floor(num / 1000)
  const bai = Math.floor((num % 1000) / 100)
  const shi = Math.floor((num % 100) / 10)
  const ge = num % 10

  if (qian > 0) str += digitMap[qian] + unitMap[3]
  if (bai > 0) {
    str += digitMap[bai] + unitMap[2]
  } else if (str) {
    str += "零"
  }
  if (shi > 0) {
    str += digitMap[shi] + unitMap[1]
  } else if (str && !str.endsWith("零") && ge > 0) {
    str += "零"
  }
  if (ge > 0) {
    str += digitMap[ge]
  }

  // 合并连续零
  str = str.replace(/零+/g, "零")
  str = str.replace(/^零+/, "")
  str = str.replace(/零+$/, "")
  return str
}
