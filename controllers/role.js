'use strict'

const uuid = require('uuid')
const { Role } = require('../models')
const { ROLE_STATUS } = require('../common/status')
const { entities } = require('../common/entities')
const { actions } = require('../common/actions')
const { get } = require('lodash')

const validatePermissions = (permissions) => {
  // validate entities
  if (get(permissions, 'entities', []).length <= 0) {
    throw new Error('The permissions are invalid since they do not contain any entities.')
  }
  permissions.entities.forEach(entity => {
    if (!entities.includes(entity.name)) {
      throw new Error(`The permissions are invalid since it includes an invalid entity: ${entity.name}`)
    }
    // validate actions
    if (get(entity, 'actions', []).length <= 0) {
      throw new Error(`The permissions are invalid since there are no actions on the entity: ${entity.name}`)
    }
    entity.actions.forEach(action => {
      if (!actions.includes(action)) {
        throw new Error(`The permissions are invalid since ${entity.name} has an invalid action: ${action}`)
      }
    })
  })
}

/**
 * Get all roles.
 */
const getAll = async (req, res) => {
  try {
    const roles = await Role.findAll({
      attributes: ['id', 'name', 'permissions', 'status']
    })
    return res.status(200).json(roles)
  } catch (error) {
    console.error(error)
    return res.status(404).json({ message: 'Unable to find all roles.' })
  }
}

/**
 * Get a role by id.
 */
const getById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id, {
      attributes: ['id', 'name', 'permissions', 'status']
    })
    return res.status(200).json(role)
  } catch (error) {
    console.error(error)
    return res.status(404).json({ message: 'Unable to find role by id.' })
  }
}

/**
 * Add a role.
 * Returns an error if the role already exists.
 */
const create = async (req, res) => {
  try {
    if (!req.body || !req.body.name || !req.body.permissions) {
      console.log(`User ${req.user.id} tried to create a role without the required fields. ${JSON.stringify(req.body)}`)
      return res.status(409).json({ message: 'Name and permissions are required fields.' })
    }

    const id = uuid.v4()
    const status = ROLE_STATUS.NEW
    const { id: userId } = req.user
    const { name, permissions } = req.body

    validatePermissions(permissions)

    const role = await Role.create({
      id,
      name,
      permissions,
      status,
      createdBy: userId,
      updatedBy: userId
    })

    return res.status(200).json({ message: `Role ${role.name} was created.` })
  } catch (error) {
    console.error(error)
    return res.status(409).json({ message: 'Unable to create role.' })
  }
}

/**
 * Update a role by id.
 */
const update = async (req, res) => {
  try {
    if (!req.body || (!req.body.name && !req.body.permissions)) {
      console.log(`User ${req.user.id} tried to update a role without a modifiable property. ${JSON.stringify(req.body)}`)
      return res.status(500).json({ message: 'No modifiable role property was provided.' })
    }

    const { name, permissions } = req.body

    validatePermissions(permissions)

    const { id: userId } = req.user
    const fields = { updatedBy: userId }

    if (name) fields.name = name
    if (permissions) fields.permissions = permissions

    const options = { where: { id: req.params.id } }

    const response = await Role.update(fields, options)
    // response is an array with the first item being how many records were affected
    if (response[0]) {
      return res.status(200).json({ message: 'Role was updated.' })
    }
    console.log(`Failed to update the role with the following fields: ${JSON.stringify(fields)} and options: ${JSON.stringify(options)}`)
    return res.status(500).json({ message: 'Unable to update the role.' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Unable to update the role.' })
  }
}

/**
 * Delete role by id.
 * Soft delete.
 */
const softDelete = async (req, res) => {
  try {
    const fields = { status: ROLE_STATUS.DELETED }
    const options = { where: { id: req.params.id } }

    await Role.update(fields, options)
    return res.status(200).json({ message: 'Role was deleted.' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Unable to delete the role.' })
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  softDelete
}
