var express = require('express')
var router = express.Router()
var Congregation = require('../../models').Congregation
var uuid = require('uuid')

router.get('/', async function (req, res, next) {
  let congregations
  try {
    congregations = await Congregation.findAll({
      attributes: ['id', 'name']
    })
  } catch (error) {
    res.status(404).json({ message: 'Unable to find all congregations.' })
  }

  res.status(200).json(congregations)
})

router.post('/', async function (req, res, next) {
  const id = uuid.v4()
  const name = req.body.name
  let congregation
  try {
    congregation = await Congregation.create({id, name})
  } catch (error) {
    res.status(409).json({ message: 'Unable to create congregation.' })
  }

  res.status(200).json(congregation)
})

router.get('/:id', async function (req, res, next) {
  let congregation
  try {
    congregation = await Congregation.findById(req.params.id)
  } catch (error) {
    res.status(404).json({ message: 'Unable to find congregation by id.' })
  }

  res.status(200).json(congregation)
})

router.patch('/:id', async function (req, res, next) {
  if (!req.body.name) {
    res.status(500).json({ message: 'No modifiable congregation property was provided.' })
  }

  let congregation
  try {
    congregation = await Congregation.findById(req.params.id)
  } catch (error) {
    res.status(404).json({ message: 'Unable to find congregation by id.' })
  }

  const response = await congregation.update({ name: req.body.name })
  const statusCode = response ? 200 : 500
  const statusMessage = response ? 'Congregation was updated.' : 'Failed to update the congregation.'
  res.status(statusCode).json({ message: statusMessage })
})

module.exports = router
