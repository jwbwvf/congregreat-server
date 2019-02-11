'use strict'

const { Role } = require('../models')
const { USER_ROLE_STATUS } = require('../common/status')

// middleware to set the permissions the logged in user has
// this gets called prier to any of the protected (non public) routes
const setUserPermissions = async (req, res, next) => {
  try {
    const { roleIds = [] } = req.user
    if (!roleIds || roleIds.length === 0) {
      throw Error('No roles found.');
    }

    const response = await Role.findAll({
      attributes: ['name', 'permissions'],
      where: { id: roleIds, status: USER_ROLE_STATUS.NEW }
    })

    if (!response || response.length === 0) {
      throw new Error(`Could not find role ${roleIds.join(', ')}`)
    }

    // since each role has it's own array of permissions combine them
    const entities = response.flatMap(role => {
      const { permissions = {} } = role
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
    return res;
  }
}

module.exports = {
  setUserPermissions
}
