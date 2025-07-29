import AppError from './AppError'

class NotFoundError extends AppError {
  constructor(message, statusCode = 404) {
    super(message)

    this.statusCode = statusCode
  }
}

export default NotFoundError
