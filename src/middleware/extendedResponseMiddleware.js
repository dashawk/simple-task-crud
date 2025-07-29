import { hasMessage, isEmptyObject } from '../utils/helpers.js'

function extendedResponseMiddleware(req, res, next) {
  res.success = (message, statusCode = 200) => {
    let msg
    let data

    if (typeof message === 'string') {
      msg = message
    } else {
      data = message

      if (hasMessage(data)) {
        msg = data.message

        delete data.message
      }
    }

    const response = responseData(msg, data)

    res.status(statusCode).json({ success: true, ...response })
  }

  res.response = (data, statusCode = 200) => {
    const response = {}

    if (hasMessage(data)) {
      response.message = data.message
      delete data.message
    }

    res
      .status(statusCode)
      .json({ success: statusCode < 400, ...response, ...data })
  }

  res.error = (message, statusCode = 400) => {
    let msg
    let data

    if (typeof message === 'string') {
      msg = message
    } else {
      data = message

      if (hasMessage(data)) {
        msg = data.message

        delete data.message
      }
    }

    const response = responseData(msg, data, true)

    res.status(statusCode).json({ success: false, ...response })
  }

  res.badRequest = (message = 'Bad Request', statusCode = 400) => {
    res.error(message, statusCode)
  }

  res.forbidden = (message = 'Forbidden', statusCode = 403) => {
    res.error(message, statusCode)
  }

  res.notFound = (message = 'Not Found', statusCode = 404) => {
    res.error(message, statusCode)
  }

  res.alreadyExists = (message = 'Already exists', statusCode = 409) => {
    res.error(message, statusCode)
  }

  res.unauthorized = (message = 'Unauthorized Access', statusCode = 401) => {
    res.error(message, statusCode)
  }

  res.internalError = (message = 'Internal Server Error', statusCode = 500) => {
    res.error(message, statusCode)
  }

  next()
}

export default extendedResponseMiddleware

function responseData(message, data, isError) {
  const response = {}

  if (data && (!isEmptyObject(data) || data?.length > 0)) {
    if (isError) {
      response.errors = data
    } else {
      response.data = data
    }
  }

  if (message) {
    response.message = message
  }

  return response
}
