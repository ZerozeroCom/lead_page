import express from 'express'
import fetch from 'node-fetch'
import dotenv from 'dotenv'
import crypto from 'crypto'
import { getStoredDomain, setStoredDomain } from './domainStore.js';

dotenv.config()

const app = express()

app.use(express.json({ limit: '100kb' }))

const TARGET_URL = process.env.TARGET_URL
const API_KEY = process.env.API_KEY

app.get('/api/register/:orderId', async (req, res) => {
    const registerOrderId = req.params.orderId
  
    try {
      const clientIp = getClientIp(req)
      const signedAt = Math.floor(Date.now() / 1000)
  
      const params = {
        register_order_id: registerOrderId,
        signed_at: signedAt
      }
  
      const signature = generateSignature(
        params,
        API_KEY
      )
  
      const payload = {
        ...params,
        signature
      }
  
      const response = await fetch(
        TARGET_URL+'/api/register/query_order',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'X-Applicant-IP': clientIp
          },
          body: JSON.stringify(payload)
        }
      )
  
      // ⛔ 429 直接顯示錯誤頁（不要讓前端重試）
      if (response.status === 429) {
        return res.status(429).send('Too many requests')
      }
      console.log(response)
      // 先確認狀態
        if (!response.ok) {
            const text = await response.text()
            return res.status(response.status).send(text)
        }
    
      // 只有 200 才 parse JSON
        const data = await response.json()
        return res.json(data)

    } catch (err) {
      console.error(err)
      res.status(500).send('Server error')
    }
  })

app.post('/api/submit', async (req, res) => {
  try {
    const clientIp = getClientIp(req)

    const params = {
        ...req.body
    }

    // 產生 signature
    const signature = generateSignature(params, API_KEY)

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

app.get('/healthz', async (req, res) => {
    try {
        // 1️⃣ 取得實際連線域名
        const incomingDomain =
          req.headers['x-forwarded-host'] ||
          req.headers['host'];
    
        if (!incomingDomain) {
          return res.status(400).send('missing host');
        }
    
        const storedDomain = getStoredDomain();
        console.log(storedDomain ,incomingDomain )
        // 2️⃣ 比對
        if (storedDomain !== incomingDomain) {
          const signed_at = Math.floor(Date.now() / 1000);
          const params = {
            domain_name:incomingDomain,
            signed_at
         }
          const signature = generateSignature(params, API_KEY)
          const payload = {
            ...params,
            signature
        }
    
          // 3️⃣ 呼叫後端 API 同步
          const resp = await fetch(
            TARGET_URL+ '/api/register/domain_name',
            {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'X-Applicant-IP': req.ip,
              },
              body: JSON.stringify(payload)
            }
          );
    
          if (!resp.ok && resp.status !== 204) {
            throw new Error(`sync failed: ${resp.status}`);
          }
    
          // 4️⃣ 更新本地持久化
          setStoredDomain(incomingDomain);
        }
    
        res.send('ok');
      } catch (err) {
        console.error('[healthz]', err);
        res.status(500).send('unhealthy');
      }
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