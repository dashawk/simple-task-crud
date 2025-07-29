import { env } from './env'

import taskRoutes from '../routes/tasks/route'

const apiVersion = env('API_VERSION', 'v1')
const apiUri = `/api/${apiVersion}`

const registerRoutes = (app) => {
  // Register all routes
  app.use(`${apiUri}/tasks`, taskRoutes)
}

export default registerRoutes
