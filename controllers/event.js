'use strict'

const uuid = require('uuid')
const { Event } = require('../models')
const { EVENT_STATUS } = require('../common/status')

const create = async (req, res) => {
  try {
    const { name, description, startDate, endDate, startTime, endTime } = req.body
    if (!name || !startDate || !endDate || !startTime || !endTime) {
      console.log(`User ${req.user.id} tried to create an event without the required fields. ${JSON.stringify(req.body)}`)
      return res.status(409).json({ message: 'Not all required fields were provided.' })
    }

    const id = uuid.v4()
    const status = EVENT_STATUS.NEW
    const { id: userId, congregationId } = req.user

    const event = await Event.create({
      id,
      name,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      status,
      congregationId,
      updatedBy: userId,
      createdBy: userId
    })
    return res.status(200).json(event)
  } catch (error) {
    console.error(error)
    return res.status(409).json({ message: 'Unable to create event.' })
  }
}

const getAll = async (req, res) => {
  try {
    const event = await Event.findAll({ attributes: [
      'id',
      'name',
      'description',
      'startDate',
      'endDate',
      'startTime',
      'endTime',
      'status',
      'congregationId'
    ]})
    return res.status(200).json(event)
  } catch (error) {
    console.error(error)
    return res.status(404).json({ message: 'Unable to find all events.' })
  }
}

const getById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id, { attributes: [
      'id',
      'name',
      'description',
      'startDate',
      'endDate',
      'startTime',
      'endTime',
      'status',
      'congregationId'
    ]})
    return res.status(200).json(event)
  } catch (error) {
    console.error(error)
    return res.status(404).json({ message: 'Unable to find event by id.' })
  }
}

const update = async (req, res) => {
  try {
    const { name, description, startDate, endDate, startTime, endTime } = req.body
    if (!name && !description && !startDate && !endDate && !startTime && !endTime) {
      console.log(`User ${req.user.id} tried to update an event without a modifiable property. ${JSON.stringify(req.body)}`)
      return res.status(500).json({ message: 'No modifiable event property was provided.' })
    }

    const options = { where: { id: req.params.id } }
    const { id: userId } = req.user

    const fields = { updatedBy: userId }
    if (name) fields.name = name
    if (description) fields.description = description
    if (startDate) fields.startDate = startDate
    if (endDate) fields.endDate = endDate
    if (startTime) fields.startTime = startTime
    if (endTime) fields.endTime = endTime

    await Event.update(fields, options)
    return res.status(200).json({ message: 'Event was updated.' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Unable to update the event.' })
  }
}

const softDelete = async (req, res) => {
  try {
    const fields = { status: EVENT_STATUS.DELETED }
    const options = { where: { id: req.params.id } }

    await Event.update(fields, options)
    return res.status(200).json({ message: 'Event was deleted.' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Unable to delete the event.' })
  }
}

module.exports = {
  create,
  getAll,
  getById,
  update,
  softDelete
}
