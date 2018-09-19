const express = require('express')
const router = express.Router()
const { Attendance } = require('../../models')
const uuid = require('uuid')

router.post('/', async function (req, res, next) {
  if (!req.body.memberId || !req.body.eventId) {
    return res.status(409).json({ message: 'All fields are required.' })
  }

  const id = uuid.v4()
  const { memberId, eventId } = req.body

  try {
    const attendance = await Attendance.create({ id, memberId, eventId })
    return res.status(200).json(attendance)
  } catch (error) {
    return res.status(409).json({ message: 'Unable to add attendance record.' })
  }
})

router.delete('/:id', async function (req, res, next) {
  try {
    await Attendance.destroy({ where: { id: req.params.id } })
    return res.status(200).json({ message: 'Attendance record was deleted.' })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete the attendance record.' })
  }
})

module.exports = router
