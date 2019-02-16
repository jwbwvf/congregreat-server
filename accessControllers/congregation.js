'use strict'

const { READ } = require('../common/actions')
const { CONGREGATION } = require('../common/entities')
const { isSystemAdmin } = require('./isSystemAdmin')
const { get } = require('lodash')

const canAccess = action => {
  return (req, res, next) => {
    const { congregationId, permissions } = req.user

    // system admin has access to all entities with permissions to every action across all congregations
    if (isSystemAdmin(permissions)) {
      return next()
    }

    // only the system admin can access a congregation they are not a member of
    if (congregationId !== req.params.id) {
      console.log(`User ${req.user.id} is not a member of congregation ${req.params.id} and tried to ${action} the congregation.`)
      return res.status(401).json({ message: `Not authorized to ${action} this congregation.` })
    }

    // all members can read their own congregation
    if (action === READ) {
      return next()
    }

    // if the user has access to the entity and the permission to take the action and are part of the congregation then allow access
    if (get(permissions, 'entities', []).length > 0) {
      const entity = permissions.entities.find(entity => entity.name === CONGREGATION)
      if (get(entity, 'actions', []).includes(action)) {
        return next()
      }
    }

    // user is a member of the congregation but does not have the correct permissions to take the action
    console.log(`User ${req.user.id} tried to ${action} congregation ${req.params.id}.`)
    return res.status(401).json({ message: `Not authorized to ${action} this congregation.` })
  }
}

module.exports = {
  canAccess
}
