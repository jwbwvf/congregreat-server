'use strict'

const canAccess = action => {
  return (req, res, next) => {
    next()
  }
}
module.exports = {
  canAccess
}
