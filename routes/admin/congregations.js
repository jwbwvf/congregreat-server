var express = require('express')
var router = express.Router()
var Congregation = require('../../models').Congregation

router.get('/', async function (req, res, next) {
  let congregations
  try {
    congregations = await Congregation.findAll({
      attributes: ['id', 'name']
    })
  } catch (error) {
    res.status(400).json(error)
  }

  res.status(200).json(congregations)
})

module.exports = router
