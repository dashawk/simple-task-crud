import 'dotenv/config'

import express from 'express'
import { appMiddlewares } from './middleware/appMiddlewares'
import registerRoutes from './utils/registerRoutes'
import errorMiddleware from './middleware/errorMiddleware'
import { env } from './utils/env'
import { createDatabaseIfNotExists } from './config/database'

async function createApp() {
  const port = process.env.APP_PORT || 3000
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

  return { app, port }
}

async function startServer() {
  try {
    // Initialize database first
    await createDatabaseIfNotExists()

    // Create and start the app
    const { app, port } = await createApp()

    app.listen(port, () => {
      console.log(`Server running in http://localhost:${port}`)
    })
  } catch (error) {
    console.error('ERROR:', error.message)
    process.exit(1)
  }
}

// Start the server
startServer()
