// 牛牛AI 官网 · Zeabur 一体化服务器
// 托管 dist/ 静态前端 + 挂载 Supabase 版 API（cloud-functions/api/[[default]].js）
import 'dotenv/config'
import express from 'express'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import apiApp from '../cloud-functions/api/[[default]].js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 8080

// API（该 app 内部同时兼容 /api 前缀）
app.use('/api', apiApp)

// 静态前端 + SPA 回退
const dist = path.join(__dirname, '..', 'dist')
if (fs.existsSync(dist)) {
  app.use(express.static(dist))
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')))
} else {
  app.get('/', (_req, res) => res.status(503).send('frontend not built'))
}

app.listen(PORT, () => {
  console.log(`[zeabur] 牛牛AI 官网已启动: http://localhost:${PORT}`)
})
