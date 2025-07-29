// Error handling middleware
const errorMiddleware = (err, req, res, next) => {
  // Clone the error object to avoid mutating the original
  const _error = { ...err }

  _error.message = _error.message || err.message

  // Send error response
  const statusCode =
    _error.statusCode !== undefined && _error.statusCode !== null
      ? _error.statusCode
      : 500

  // Base error response
  const errorResponse = {
    error: true,
    message: _error.message
  }

  if (process.env.APP_DEBUG === 'true') {
    // Get the filename and line number from stack trace
    if (err.stack) {
      const stackLines = err.stack.split('\n')
      const relevantLine = stackLines.find(
        (line) => line.includes('.js:') && !line.includes('node_modules')
      )

      if (relevantLine) {
        const match = relevantLine.match(/([^\/\\]+\.js):(\d+):(\d+)/)
        if (match) {
          // errorResponse.filename = match[1]
          // errorResponse.lineNumber = parseInt(match[2])
        }
      }
    }

    // Add the full stack trace
    // errorResponse.stack = err.stack
  }

  res.status(statusCode).json(errorResponse)
}

export default errorMiddleware
