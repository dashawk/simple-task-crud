export const hasMessage = (data) => {
  return Object.prototype.hasOwnProperty.call(data, 'message')
}

export const isEmptyObject = (obj) => {
  return Object.keys(obj).length === 0
}
