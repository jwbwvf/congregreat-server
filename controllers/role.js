'use strict'

const uuid = require('uuid/v4')
const { Role } = require('../models')
const { ROLE_STATUS } = require('../common/status')

/**
 * Get all roles across all congregations.
 */
const getAll = async function (req, res) {
  try {
    const roles = await Role.findAll({
      attributes: ['id', 'name', 'congregationId']
    })
    return res.status(200).json(roles)
  } catch (error) {
    return res.status(404).json({ message: 'Unable to find all roles.' })
  }
}

/**
 * Get a role by id.
 */
const getById = async function (req, res) {
  try {
    const role = await Role.findById(req.params.id, {
      attributes: ['id', 'name', 'congregationId']
    })
    return res.status(200).json(role)
  } catch (error) {
    return res.status(404).json({ message: 'Unable to find role by id.' })
  }
}

/**
 * Get all roles of a congregation.
 */
const getByCongregationId = async function (req, res) {
  try {
    const roles = await Role.findAll({
      where: { congregationId: req.params.id },
      attributes: ['id', 'name']
    })
    return res.status(200).json(roles)
  } catch (error) {
    return res.status(404).json({ message: 'Unable to find all roles of the congregation.' })
  }
}

/**
 * Add a role.
 * name, congregationId are required.
 * Returns an error if the role already exists.
 */
const create = async function (req, res) {
  if (!req.body.name ||
    !req.body.congregationId) {
    return res.status(409).json({ message: 'All fields are required.' })
  }

  const roleFound = await Role.findOne({ where: { name: req.body.name } })
  if (roleFound) {
    return res.status(409).json({ message: 'A role already exists with this name.' })
  }

  try {
    const id = uuid()
    const status = ROLE_STATUS.NEW
    const { name, congregationId } = req.body
    const { id: userId } = req.user
    const role = await Role.create({ id, name, congregationId, status, createdBy: userId, updatedBy: userId })

    return res.status(200).json({ message: `Role ${role.name} was added.` })
  } catch (error) {
    console.error(error)
    return res.status(409).json({ message: 'Unable to create role.' })
  }
}

/**
 * Update a role by id.
 */
const update = async function (req, res) {
  if (!req.body.name) {
    return res.status(500).json({ message: 'No modifiable role property was provided.' })
  }

  try {
    const { name } = req.body
    const roleFound = await Role.findOne({ where: { name } })
    if (roleFound) {
      return res.status(409).json({ message: 'A role already exists with this name.' })
    }

    const { id: userId } = req.user
    const fields = { name, updatedBy: userId }
    const options = { where: { id: req.params.id } }

    const response = await Role.update(fields, options)
    // response is an array with the first item being how many records were affected
    if (response[0]) {
      return res.status(200).json({ message: 'Role was updated.' })
    }
    return res.status(500).json({ message: 'Failed to update the role.' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Failed to update the role.' })
  }
}

/**
 * Delete role by id.
 * Soft delete.
 */
const softDelete = async function (req, res) {
  try {
    const fields = { status: ROLE_STATUS.DELETED }
    const options = { where: { id: req.params.id } }

    await Role.update(fields, options)
    return res.status(200).json({ message: 'Role was deleted.' })
  } catch (error) {
    return res.status(404).json({ message: 'Unable to find role by id.' })
  }
}

module.exports = {
  getAll,
  getById,
  getByCongregationId,
  create,
  update,
  softDelete
}
