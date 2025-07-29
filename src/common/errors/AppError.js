class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message instanceof Array ? message.join(', ') : message)

    this.name = this.constructor.name
    this.statusCode = statusCode
  }

  json() {
    const response = {
      name: this.name,
      statusCode: this.statusCode,
      message: this.message
    }

    if (this.data !== null && typeof this.data !== 'undefined') {
      response.data = this.data
    }

    return response
  }
}

export default AppError
