import { env } from '../utils/env'
import AppError from '../common/errors/AppError'

const isDebug = env('APP_DEBUG', 'true') === 'true'

export const initializeDatabase = async () => {
  try {
    console.log('Database initialization')
  } catch (err) {
    throw new AppError('Error initializing database')
  }
}
