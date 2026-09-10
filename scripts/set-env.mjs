#!/usr/bin/env node
/**
 * 安全写入 .env：只改指定键，其余内容原样保留。
 *
 * 用法（在 official/ 下执行）：
 *   npm run set:env RESEND_API_KEY re_xxxxxxxx
 *   npm run set:env ALIYUN_SMS_SIGN_NAME=速通互联 ALIYUN_SMS_TEMPLATE_CODE=100001
 *   npm run set:env RESEND_API_KEY          # 不带值时进入隐藏输入，密钥不会留在命令历史里
 */
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const envPath = path.join(root, '.env')

// ---------- 解析参数 ----------
const args = process.argv.slice(2)
if (!args.length) {
  console.error('用法: npm run set:env KEY VALUE [KEY2=VALUE2 ...]')
  process.exit(1)
}

const pairs = []
for (let i = 0; i < args.length; i++) {
  const a = args[i]
  if (a.includes('=')) {
    const idx = a.indexOf('=')
    pairs.push([a.slice(0, idx).trim(), a.slice(idx + 1).trim()])
  } else {
    const next = args[i + 1]
    if (next && !next.includes('=') && args.length === 2) {
      pairs.push([a.trim(), next.trim()])
      i++
    } else {
      pairs.push([a.trim(), null]) // 待隐藏输入
    }
  }
}

// ---------- 隐藏输入 ----------
function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true })
    const onData = (char) => {
      if (['\n', '\r', '\u0004'].includes(char.toString())) {
        process.stdin.removeListener('data', onData)
      } else {
        // 用退格覆盖已回显的字符
        readline.clearLine(process.stdout, 0)
        readline.cursorTo(process.stdout, 0)
        process.stdout.write(question)
      }
    }
    process.stdin.on('data', onData)
    rl.question(question, (answer) => {
      process.stdin.removeListener('data', onData)
      rl.close()
      process.stdout.write('\n')
      resolve(answer.trim())
    })
  })
}

for (const p of pairs) {
  if (p[1] === null) {
    p[1] = await askHidden(`${p[0]} = `)
  }
}

// ---------- 读取并更新 ----------
if (!fs.existsSync(envPath)) {
  console.error(`找不到 ${envPath}`)
  process.exit(1)
}
const original = fs.readFileSync(envPath, 'utf8')
const lines = original.split('\n')
const touched = new Set()

for (const [key, value] of pairs) {
  if (!/^[A-Za-z0-9_]+$/.test(key)) {
    console.error(`键名不合法: ${key}`)
    process.exit(1)
  }
  const re = new RegExp(`^\\s*${key}\\s*=`)
  const idx = lines.findIndex((l) => re.test(l))
  const next = `${key}=${value}`
  if (idx >= 0) {
    lines[idx] = next
  } else {
    // 追加到末尾（去掉尾部空行后再加）
    while (lines.length && lines[lines.length - 1].trim() === '') lines.pop()
    lines.push(next)
  }
  touched.add(key)
}

fs.writeFileSync(envPath, lines.join('\n') + '\n')

// ---------- 回显（只显示长度，不回显密钥本体） ----------
console.log('\n已更新 .env：')
for (const [key, value] of pairs) {
  const masked = value ? `${value.slice(0, 4)}…（${value.length} 字符）` : '空值'
  console.log(`  ${key} = ${masked}`)
}
console.log('\n下一步：npm run check:auth\n')
