var express = require('express')
var router = express.Router()
var Congregation = require('../../models').Congregation
const uuid = require('uuid')
const { CONGREGATION_STATUS } = require('../../common/status')

router.get('/', async function (req, res, next) {
  try {
    const congregations = await Congregation.findAll({attributes: ['id', 'name', 'status']})
    res.status(200).json(congregations)
  } catch (error) {
    res.status(404).json({ message: 'Unable to find all congregations.' })
  }
})

router.post('/', async function (req, res, next) {
  const id = uuid.v4()
  const name = req.body.name
  const status = CONGREGATION_STATUS.NEW

  try {
    const congregation = await Congregation.create({id, name, status})
    res.status(200).json(congregation)
  } catch (error) {
    res.status(409).json({ message: 'Unable to create congregation.' })
  }
})

router.get('/:id', async function (req, res, next) {
  try {
    const congregation = await Congregation.findById(req.params.id, {attributes: ['id', 'name', 'status']})
    res.status(200).json(congregation)
  } catch (error) {
    res.status(404).json({ message: 'Unable to find congregation by id.' })
  }
})

router.patch('/:id', async function (req, res, next) {
  if (!req.body.name) {
    return res.status(500).json({ message: 'No modifiable congregation property was provided.' })
  }

  let congregation
  try {
    congregation = await Congregation.findById(req.params.id)
  } catch (error) {
    return res.status(404).json({ message: 'Unable to find congregation by id.' })
  }

  const response = await congregation.update({ name: req.body.name })
  if (response) {
    res.status(200).json({ message: 'Congregation was updated.' })
  } else {
    res.status(500).json({ message: 'Failed to update the congregation.' })
  }
})

router.delete('/:id', async function (req, res, next) {
  let congregation
  try {
    congregation = await Congregation.findById(req.params.id)
  } catch (error) {
    return res.status(404).json({ message: 'Unable to find congregation by id.' })
  }

  const response = await congregation.update({ status: CONGREGATION_STATUS.DELETED })
  if (response) {
    res.status(200).json({ message: 'Congregation was deleted.' })
  } else {
    res.status(500).json({ message: 'Failed to delete the congregation.' })
  }
})

module.exports = router
