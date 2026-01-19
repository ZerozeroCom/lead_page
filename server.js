import express from 'express'
import fetch from 'node-fetch'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.use(express.json({ limit: '100kb' }))

const TARGET_URL = process.env.TARGET_URL
const API_KEY = process.env.API_KEY

app.post('/api/forward', async (req, res) => {
  try {
    const params = {
        ...req.body
    }

    // 產生 signature
    const signature = generateSignature(params, process.env.API_KEY)

    // 最終 payload
    const payload = {
        ...params,
        signature
    }

    const response = await fetch(TARGET_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'X-Applicant-IP': clientIp
        },
        body: JSON.stringify(payload)
    })

    const text = await response.text()

    // 429 原樣回傳給前端（很重要）
    if (response.status === 429) {
      return res.status(429).send(text)
    }

    res.status(response.status).send(text)
    } catch (err) {
        console.error(err)
        res.status(502).json({ error: 'Bad gateway' })
    }
})

app.get('/health', (_, res) => {
  res.send('ok')
})

app.listen(3000)

function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for']
    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }
    return req.socket.remoteAddress
}

function generateSignature(params, secret) {
// 1️⃣ 移除空值 & signature 本身
const filtered = Object.entries(params)
    .filter(([k, v]) => v !== '' && v !== null && v !== undefined && k !== 'signature')

// 2️⃣ ASCII 排序
filtered.sort(([a], [b]) => a.localeCompare(b))

// 3️⃣ key=value 串接
const queryString = filtered
    .map(([k, v]) => `${k}=${String(v)}`)
    .join('&')

// 4️⃣ 加上密鑰
const signSource = queryString + secret

// 5️⃣ sha3-256 → hex lowercase
return crypto
    .createHash('sha3-256')
    .update(signSource, 'utf8')
    .digest('hex')
}