'use strict'

const { Role } = require('../models')

// middleware to set the permissions the logged in user has
// this gets called prier to any of the protected (non public) routes
const setUserPermissions = async (req, res, next) => {
  try {
    const { roleIds = [] } = req.user
    const fields = { attributes: ['permissions'] }
    const options = { where: { id: roleIds } }
    const response = await Role.findAll(fields, options)
    const { permissions = [] } = response[0] ? response[0] : []
    req.user.permissions = permissions
    next()
  } catch (error) {
    console.error(error)
    res.status(401).send('Unauthorized')
  }
}

module.exports = {
  setUserPermissions
}
