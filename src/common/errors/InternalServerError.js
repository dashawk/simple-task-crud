import AppError from './AppError'

class InternalServerError extends AppError {
  constructor(error, statusCode = 500) {
    super(error.message)

    this.statusCode = statusCode
  }
}

export default InternalServerError
