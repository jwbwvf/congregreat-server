'use strict'

const uuid = require('uuid/v4')
const { UserRole } = require('../models')
const { USER_ROLE_STATUS } = require('../common/status')

/**
 * Get all userRoles across all congregations.
 */
const getAll = async (req, res) => {
  try {
    const roles = await UserRole.findAll({
      attributes: ['id', 'userId', 'roleId', 'status']
    })
    return res.status(200).json(roles)
  } catch (error) {
    return res.status(404).json({ message: 'Unable to find all roles.' })
  }
}

/**
 * Get a userRole by id.
 */
const getById = async (req, res) => {
  try {
    const userRole = await UserRole.findById(req.params.id, {
      attributes: ['id', 'userId', 'roleId', 'status']
    })
    return res.status(200).json(userRole)
  } catch (error) {
    return res.status(404).json({ message: 'Unable to find userRole by id.' })
  }
}

/**
 * Add a userRole.
 * Returns an error if the role already exists.
 */
const create = async (req, res) => {
  if (!req.body.userId || !req.body.roleId) {
    return res.status(409).json({ message: 'userId and roleId are required fields.' })
  }

  try {
    const id = uuid()
    const { userId, roleId } = req.body
    const status = USER_ROLE_STATUS.NEW
    await UserRole.create({
      id,
      userId,
      roleId,
      status,
      createdBy: userId,
      updatedBy: userId
    })

    return res.status(200).json({ message: `UserRole was added.` })
  } catch (error) {
    console.error(error)
    return res.status(409).json({ message: 'Unable to create role.' })
  }
}

/**
 * Delete userRole by id.
 * Soft delete.
 */
const softDelete = async (req, res) => {
  try {
    const fields = { status: USER_ROLE_STATUS.DELETED }
    const options = { where: { id: req.params.id } }

    await UserRole.update(fields, options)
    return res.status(200).json({ message: 'UserRole was deleted.' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Unable to delete userRole.' })
  }
}

module.exports = {
  getAll,
  getById,
  create,
  softDelete
}
