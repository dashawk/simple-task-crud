const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next)
  } catch (err) {
    // Handle the error
    next(err)
  }
}

export default asyncHandler
