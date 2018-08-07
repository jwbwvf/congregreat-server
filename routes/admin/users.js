var express = require('express')
var router = express.Router()
var User = require('../../models').User
const {USER_STATUS} = require('../../common/status')

router.get('/', async function (req, res, next) {
  let users
  try {
    users = await User.findAll({
      attributes: ['id', 'first_name', 'last_name', 'email', 'congregation_id', 'status']
    })
  } catch (error) {
    res.status(400).json({ message: 'Unable to find all users.' })
  }
  res.status(200).json(users)
})

router.get('/:id', async function (req, res, next) {
  try {
    const user = await User.findById(req.params.id, {
      attributes: ['id', 'first_name', 'last_name', 'email', 'congregation_id', 'status']
    })
    res.status(200).json(user)
  } catch (error) {
    res.status(404).json({ message: 'Unable to find user by id.' })
  }
})

router.patch('/:id', async function (req, res, next) {
  if (!req.body.first_name &&
      !req.body.last_name &&
      !req.body.email) {
    return res.status(500).json({ message: 'No modifiable user property was provided.' })
  }

  let user
  try {
    user = await User.findById(req.params.id)
  } catch (error) {
    return res.status(404).json({ message: 'Unable to find user by id.' })
  }

  const fields = {}
  if (req.body.first_name) fields.firstName = req.body.first_name
  if (req.body.last_name) fields.lastName = req.body.last_name
  if (req.body.email) fields.email = req.body.email

  const response = await user.update(fields)
  if (response) {
    res.status(200).json({ message: 'User was updated.' })
  } else {
    res.status(500).json({ message: 'Failed to update the user.' })
  }
})

router.delete('/:id', async function (req, res, next) {
  let user
  try {
    user = await User.findById(req.params.id)
  } catch (error) {
    return res.status(404).json({ message: 'Unable to find user by id.' })
  }

  const response = await user.update({ status: USER_STATUS.DELETED })
  if (response) {
    res.status(200).json({ message: 'User was deleted.' })
  } else {
    res.status(500).json({ message: 'Failed to delete the user.' })
  }
})
module.exports = router
