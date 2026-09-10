#!/usr/bin/env node
/**
 * Zeabur 生产环境操作（设置变量 / 重新部署 / 查看状态）
 *
 * 用法（在 official/ 下执行）：
 *   npm run deploy:env ALIYUN_SMS_SIGN_NAME=速通互联 ALIYUN_SMS_TEMPLATE_CODE=100001
 *   npm run deploy:redeploy        # 只重新部署
 *   npm run deploy:status          # 查看最近部署状态
 *   npm run deploy:vars            # 列出当前已配置的变量名（不含值）
 *
 * 需要 Zeabur API Token，按以下顺序查找：
 *   1. 环境变量 ZEABUR_TOKEN
 *   2. ~/.config/nna/zeabur_token
 *   Token 获取：Zeabur → Account Settings → API Token
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const API = 'https://api.zeabur.com/graphql'
// 本项目固定坐标（非密钥，可安全入库）
const SERVICE_ID = process.env.ZEABUR_SERVICE_ID || '6a99d0884177ab13f998d479'
const ENV_ID = process.env.ZEABUR_ENV_ID || '6a99d07ded7357fe0bc35e90'

const tokenPath = path.join(os.homedir(), '.config', 'nna', 'zeabur_token')
const TOKEN = process.env.ZEABUR_TOKEN || (fs.existsSync(tokenPath) ? fs.readFileSync(tokenPath, 'utf8').trim() : '')
if (!TOKEN) {
  console.error(`缺少 Zeabur Token。请放到 ${tokenPath}，或设置环境变量 ZEABUR_TOKEN。`)
  process.exit(1)
}

async function gql(query, variables) {
  const r = await fetch(API, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(30000),
  })
  const d = await r.json()
  if (d.errors) throw new Error(d.errors.map((e) => e.message).join('; '))
  return d.data
}

const cmd = process.argv[2] || 'status'
const args = process.argv.slice(3)

// ---------- 设置变量 ----------
if (cmd === 'env') {
  const pairs = args.map((a) => {
    const i = a.indexOf('=')
    if (i < 0) {
      console.error(`参数格式应为 KEY=VALUE，收到: ${a}`)
      process.exit(1)
    }
    return [a.slice(0, i), a.slice(i + 1)]
  })
  if (!pairs.length) {
    console.error('用法: npm run deploy:env KEY=VALUE [KEY2=VALUE2 ...]')
    process.exit(1)
  }

  // 先拉现有变量，已存在则改用 updateSingleEnvironmentVariable
  const cur = await gql(
    `query($s:ObjectID!,$e:ObjectID!){ service(_id:$s){ variables(environmentID:$e){ key } } }`,
    { s: SERVICE_ID, e: ENV_ID },
  )
  const existing = new Set((cur?.service?.variables || []).map((v) => v.key))

  for (const [key, value] of pairs) {
    if (existing.has(key)) {
      await gql(
        `mutation($s:ObjectID!,$e:ObjectID!,$k:String!,$v:String!){ updateSingleEnvironmentVariable(serviceID:$s,environmentID:$e,oldKey:$k,newKey:$k,value:$v){ key } }`,
        { s: SERVICE_ID, e: ENV_ID, k: key, v: value },
      )
      console.log(`  更新 ${key}`)
    } else {
      await gql(
        `mutation($s:ObjectID!,$e:ObjectID!,$k:String!,$v:String!){ createEnvironmentVariable(serviceID:$s,environmentID:$e,key:$k,value:$v){ key } }`,
        { s: SERVICE_ID, e: ENV_ID, k: key, v: value },
      )
      console.log(`  新增 ${key}`)
    }
  }

  console.log('\n触发重新部署…')
  await gql(`mutation($s:ObjectID!,$e:ObjectID!){ redeployService(serviceID:$s,environmentID:$e) }`, {
    s: SERVICE_ID,
    e: ENV_ID,
  })
  console.log('已触发。构建通常需要几分钟，可用 npm run deploy:status 查看进度。')
}

// ---------- 重新部署 ----------
else if (cmd === 'redeploy') {
  await gql(`mutation($s:ObjectID!,$e:ObjectID!){ redeployService(serviceID:$s,environmentID:$e) }`, {
    s: SERVICE_ID,
    e: ENV_ID,
  })
  console.log('已触发重新部署。')
}

// ---------- 列出变量名 ----------
else if (cmd === 'vars') {
  const d = await gql(
    `query($s:ObjectID!,$e:ObjectID!){ service(_id:$s){ variables(environmentID:$e){ key } } }`,
    { s: SERVICE_ID, e: ENV_ID },
  )
  console.log('生产环境已配置的变量（只列名，不显示值）：')
  for (const v of d?.service?.variables || []) console.log('  ' + v.key)
}

// ---------- 查看部署状态 ----------
else {
  const d = await gql(
    `query($s:ObjectID!){ service(_id:$s){ deployments { status commitSHA commitMessage createdAt finishedAt } } }`,
    { s: SERVICE_ID },
  )
  const ds = d?.service?.deployments || []
  console.log('最近部署：')
  for (const x of ds.slice(0, 6)) {
    const sha = (x.commitSHA || '').slice(0, 7)
    const msg = (x.commitMessage || '').split('\n')[0].slice(0, 46)
    console.log(`  ${String(x.status).padEnd(9)} ${sha}  ${x.createdAt}  ${msg}`)
  }
  const top = ds[0]
  if (top && (top.status === 'BUILDING' || top.status === 'PENDING')) {
    console.log('\n当前仍在构建中，稍后再查。')
  }
}
