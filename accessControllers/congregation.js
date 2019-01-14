'use strict'

const { READ } = require('../common/actions')
const { CONGREGATION } = require('../common/entities')

const canAccess = action => {
  return (req, res, next) => {
    const { congregationId, permissions } = req.user
    // viewing own congregation
    if (action === READ && congregationId === req.params.id) {
      return next()
    }

    // if the user doesn't have any permissions they are not authorized to take any actions on the congregation
    if (permissions && permissions.entities && permissions.entities.length > 0) {
      const entity = permissions.entities.find(entity => entity.name === CONGREGATION)
      if (entity.actions && entity.actions.includes(action)) {
        // TODO how to tell if this is system admin with permissions to all vs non system admin with read permissions trying to read all
        // should role system admin have all permissions defined or go by name of role
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
