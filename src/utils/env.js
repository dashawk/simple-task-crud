export const env = (key, defaultValue = '') => {
  return process.env[key] ?? defaultValue
}
