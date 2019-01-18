'use strict'

const { READ } = require('../common/actions')
const { CONGREGATION } = require('../common/entities')

const canAccess = action => {
  return (req, res, next) => {
    const { congregationId, permissions, systemAdmin = false } = req.user

    // system admin has access to all entities with permissions to every action across all congregations
    if (systemAdmin) {
      return next()
    }

    // all members can read their own congregation
    if (action === READ && congregationId === req.params.id) {
      return next()
    }

    // if the user has access to the entity and the permission to take the action and are part of the congregation then allow access
    if (permissions && permissions.entities && permissions.entities.length > 0) {
      const entity = permissions.entities.find(entity => entity.name === CONGREGATION)
      if (entity.actions && entity.actions.includes(action) && congregationId === req.params.id) {
        return next()
      }
    }

    const congregationMessage = req.params.id ? `congregation ${req.params.id}` : 'all congregations'
    console.log(`User ${req.user.id} tried to ${action} ${congregationMessage}`)
    return res.status(401).json({ message: `Not authorized to ${action} this congregation` })
  }
}

module.exports = {
  canAccess
}
