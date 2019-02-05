'use strict'

const uuid = require('uuid')
const { Congregation } = require('../models')
const { CONGREGATION_STATUS } = require('../common/status')

const create = async (req, res) => {
  const id = uuid.v4()
  const name = req.body.name
  const status = CONGREGATION_STATUS.NEW

  try {
    const congregation = await Congregation.create({ id, name, status })
    return res.status(200).json(congregation)
  } catch (error) {
    return res.status(409).json({ message: 'Unable to create congregation.' })
  }
}

const getAll = async (req, res) => {
  try {
    const congregations = await Congregation.findAll({ attributes: ['id', 'name', 'status'] })
    return res.status(200).json(congregations)
  } catch (error) {
    return res.status(404).json({ message: 'Unable to find all congregations.' })
  }
}

const getById = async (req, res) => {
  try {
    const congregation = await Congregation.findById(req.params.id, { attributes: ['id', 'name', 'status'] })
    return res.status(200).json(congregation)
  } catch (error) {
    return res.status(404).json({ message: 'Unable to find congregation by id.' })
  }
}

const update = async (req, res) => {
  if (!req.body.name) {
    return res.status(500).json({ message: 'No modifiable congregation property was provided.' })
  }

  try {
    const fields = { name: req.body.name }
    const options = { where: { id: req.params.id } }

    await Congregation.update(fields, options)
    return res.status(200).json({ message: 'Congregation was updated.' })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update congregation.' })
  }
}

// using the name softDelete since delete is a key word
const softDelete = async (req, res) => {
  try {
    const fields = { status: CONGREGATION_STATUS.DELETED }
    const options = { where: { id: req.params.id } }

    await Congregation.update(fields, options)
    return res.status(200).json({ message: 'Congregation was deleted.' })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to delete congregation.' })
  }
}

module.exports = {
  create,
  getAll,
  getById,
  update,
  softDelete
}
