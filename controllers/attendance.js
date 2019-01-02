'use strict'

const { Attendance } = require('../models')
const uuid = require('uuid')

const create = async (req, res) => {
  if (!req.body.memberId || !req.body.eventId) {
    return res.status(409).json({ message: 'All fields are required.' })
  }

  const id = uuid.v4()
  const { memberId, eventId } = req.body

  try {
    const attendance = await Attendance.create({ id, memberId, eventId })
    return res.status(200).json(attendance)
  } catch (error) {
    return res.status(409).json({ message: 'Unable to create attendance record.' })
  }
}

const destroy = async (req, res) => {
  try {
    await Attendance.destroy({ where: { id: req.params.id } })
    return res.status(200).json({ message: 'Attendance record was deleted.' })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete the attendance record.' })
  }
}

module.exports = {
  create,
  destroy
}
