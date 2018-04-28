var express = require('express')
var router = express.Router()
var User = require('../../models').User

router.get('/', async function (req, res, next) {
  let users
  try {
    users = await User.findAll({
      attributes: ['id', 'first_name', 'last_name', 'email', 'congregation_id']
    })
  } catch (error) {
    res.status(400).json(error)
  }
  res.status(200).json(users)
})

module.exports = router
