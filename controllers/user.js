'use strict'

const { User } = require('../models')
const { USER_STATUS } = require('../common/status')

const getAll = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'memberId', 'status']
    })
    return res.status(200).json(users)
  } catch (error) {
    return res.status(404).json({ message: 'Unable to find all users.' })
  }
}

const getById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id, {
      attributes: ['id', 'email', 'memberId', 'status']
    })
    return res.status(200).json(user)
  } catch (error) {
    return res.status(404).json({ message: 'Unable to find user by id.' })
  }
}

const update = async (req, res) => {
  if (!req.body.email) {
    return res.status(500).json({ message: 'No modifiable user property was provided.' })
  }

  try {
    // TODO shouldn't allow updating user email, that is their username
    // can't allow duplicates
    const fields = { email: req.body.email }
    const options = { where: { id: req.params.id } }

    await User.update(fields, options)
    return res.status(200).json({ message: 'User was updated.' })
  } catch (error) {
    return res.status(404).json({ message: 'Unable to update user.' })
  }
}

// using the name softDelete since delete is a key word
const softDelete = async (req, res) => {
  try {
    const fields = { status: USER_STATUS.DELETED }
    const options = { where: { id: req.params.id } }

    await User.update(fields, options)
    return res.status(200).json({ message: 'User was deleted.' })
  } catch (error) {
    return res.status(404).json({ message: 'Unable to delete user.' })
  }
}

module.exports = {
  getAll,
  getById,
  update,
  softDelete
}
