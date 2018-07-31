var express = require('express')
var router = express.Router()
var Congregation = require('../../models').Congregation
var uuid = require('uuid')

router.get('/', async function (req, res, next) {
  let congregations
  try {
    congregations = await Congregation.findAll({
      attributes: ['id', 'name', 'status']
    })
  } catch (error) {
    res.status(404).json({ message: 'Unable to find all congregations.' })
  }

  res.status(200).json(congregations)
})

router.post('/', async function (req, res, next) {
  const id = uuid.v4()
  const name = req.body.name
  const status = 'new'
  let congregation
  try {
    congregation = await Congregation.create({id, name, status})
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

  const response = await congregation.update({ status: 'deleted' })
  if (response) {
    res.status(200).json({ message: 'Congregation was deleted.' })
  } else {
    res.status(500).json({ message: 'Failed to delete the congregation.' })
  }
})

module.exports = router
