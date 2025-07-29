let origins

if (process.env.WHITELIST_URLS) {
  origins = process.env.WHITELIST_URLS.split(',')
}

const config = {
  origin: (origin, cb) => {
    if (
      origins === null ||
      origins.includes(origin ?? '') ||
      origin === undefined
    ) {
      cb(null, true)
    } else {
      cb(new Error('Not Allowed!'))
    }
  },
  optionsSuccessStatus: 200
}

export default config
