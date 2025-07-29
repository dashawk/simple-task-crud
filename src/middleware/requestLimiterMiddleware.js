import { rateLimit } from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10 // Maximum of 10 requests per minute
})

export default limiter
