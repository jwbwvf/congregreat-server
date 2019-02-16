'use strict'

const { READ, READ_ALL } = require('../common/actions')
const { EVENT } = require('../common/entities')
const accessor = require('./accessor')
const { get } = require('lodash')

const canAccess = action => {
  return (req, res, next) => {
    const { congregationId, permissions } = req.user

    // system admin has access to all entities with permissions to every action across all congregations
    if (accessor.isSystemAdmin(permissions)) {
      return next()
    }

    // only the system admin can access a congregation they are not a member of
    if (congregationId !== req.params.id) { // TODO this id is an event id not congregationId  need to look up the event to get it's congregationId
      console.log(`User ${req.user.id} is not a member of congregation ${req.params.id} and tried to ${action} the event.`)
      return res.status(401).json({ message: `Not authorized to ${action} this event.` })
    }

    // all members can read their own congregation's events
    if (action === READ || action === READ_ALL) {
      return next()
    }

    // if the user has access to the entity and the permission to take the action and are part of the congregation then allow access
    if (get(permissions, 'entities', []).length > 0) {
      const entity = permissions.entities.find(entity => entity.name === EVENT)
      if (get(entity, 'actions', []).includes(action)) {
        return next()
      }
    }

    // user is a member of the congregation but does not have the correct permissions to take the action
    console.log(`User ${req.user.id} tried to ${action} this event ${req.params.id}.`)
    return res.status(401).json({ message: `Not authorized to ${action} this event.` })
  }
}
module.exports = {
  canAccess
}
