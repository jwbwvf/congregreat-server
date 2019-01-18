'use strict'

const { Role } = require('../models')

// middleware to set the permissions the logged in user has
// this gets called prier to any of the protected (non public) routes
const setUserPermissions = async (req, res, next) => {
  try {
    const { roleIds = [] } = req.user
    const response = await Role.findAll({
      attributes: ['name', 'permissions'],
      where: { id: roleIds }
    })
    // since each role has it's own array of permissions combine them
    const entities = response.flatMap(role => {
      const { permissions = [] } = role
      return permissions.entities
    })
    // since system admin allows users to view more than their own congregation it has
    // to be set separately from the permissionss
    const systemAdmin = response.find(role => role.name === 'system admin')
    if (systemAdmin) {
      req.user.systemAdmin = true
    }

    req.user.permissions = {entities}
    next()
  } catch (error) {
    console.error(error)
    res.status(401).send('Unauthorized')
  }
}

module.exports = {
  setUserPermissions
}
