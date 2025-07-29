import AppError from './AppError'

class ResourceError extends AppError {
  constructor(resource, query) {
    super(`The resource ${resource} was not found.`)

    this.data = { resource, query }
    this.statusCode = 404
  }
}

export default ResourceError
