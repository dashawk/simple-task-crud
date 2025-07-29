import 'dotenv/config'

import express from 'express'
import { appMiddlewares } from '../src/middleware/appMiddlewares'
import registerRoutes from '../src/utils/registerRoutes'
import errorMiddleware from '../src/middleware/errorMiddleware'
import { env } from '../src/utils/env'

// Create Express app
const app = express()

app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(express.json({ limit: '50mb' }))

app.get('/', (req, res) => {
  res.send({
    message: 'API v1',
    version: env('API_VERSION', 'v1'),
    author: 'Jason Panugaling',
    contact: 'jmpanugaling@gmail.com'
  })
})

appMiddlewares(app)
registerRoutes(app)

app.use('*', (req, res) => {
  res.notFound()
})

/**
 * Error handling middleware must be placed last in the middleware stack.
 * This ensures it catches errors from all previous middleware and routes,
 * allowing centralized error handling across the application.
 */
app.use(errorMiddleware)

// Export the Express app as a serverless function
export default app
