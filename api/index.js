import 'dotenv/config'

import express from 'express'
import { appMiddlewares } from '../src/middleware/appMiddlewares'
import registerRoutes from '../src/utils/registerRoutes'
import errorMiddleware from '../src/middleware/errorMiddleware'
import { env } from '../src/utils/env'
import { createDatabaseIfNotExists, ensureSchema } from '../src/config/database'

// Initialize database schema on cold start
let isInitialized = false

async function initializeDatabase() {
  if (isInitialized) return

  try {
    console.log('Initializing database for Vercel deployment...')

    // Create database if it doesn't exist (only if DB_ADMIN_URL is provided)
    await createDatabaseIfNotExists()

    // Ensure schema exists (create tables, triggers, etc.)
    await ensureSchema()

    isInitialized = true
    console.log('Database initialization completed successfully')
  } catch (error) {
    console.error('Database initialization failed:', error)
    throw error
  }
}

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

// Health check endpoint for database connectivity
app.get('/health', async (req, res) => {
  try {
    const { query } = await import('../src/config/database.js')
    const result = await query('SELECT 1 as health_check')
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      initialized: isInitialized
    })
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString(),
      initialized: isInitialized
    })
  }
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

// Serverless function handler with database initialization
export default async function handler(req, res) {
  try {
    // Initialize database on first request (cold start)
    await initializeDatabase()

    // Handle the request with the Express app
    return app(req, res)
  } catch (error) {
    console.error('Handler error:', error)
    return res.status(500).json({
      error: true,
      message: 'Internal server error during initialization',
      details: error.message
    })
  }
}
