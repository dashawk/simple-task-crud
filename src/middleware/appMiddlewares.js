import compression from 'compression'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import xss from 'xss-clean'
import hpp from 'hpp'
import cors from 'cors'

import corsConfig from '../config/cors'
import extendedResponseMiddleware from './extendedResponseMiddleware'

export const appMiddlewares = (app) => {
  app.use(compression())
  app.use(cookieParser())
  app.use(helmet()) // Sets security headers
  app.use(xss()) // Prevent XSS Attacks
  app.use(hpp()) // Prevent http param pollution
  app.use(cors(corsConfig))

  app.use(extendedResponseMiddleware)
}
