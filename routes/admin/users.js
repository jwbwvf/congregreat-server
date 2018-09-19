var express = require('express')
var router = express.Router()
var User = require('../../models').User
const {USER_STATUS} = require('../../common/status')

router.get('/', async function (req, res, next) {
  let users
  try {
    users = await User.findAll({
      attributes: ['id', 'email', 'memberId', 'status']
    })
  } catch (error) {
    return res.status(404).json({ message: 'Unable to find all users.' })
  }
  return res.status(200).json(users)
})

router.get('/:id', async function (req, res, next) {
  try {
    const user = await User.findById(req.params.id, {
      attributes: ['id', 'email', 'memberId', 'status']
    })
    return res.status(200).json(user)
  } catch (error) {
    return res.status(404).json({ message: 'Unable to find user by id.' })
  }
})

router.patch('/:id', async function (req, res, next) {
  if (!req.body.email) {
    return res.status(500).json({ message: 'No modifiable user property was provided.' })
  }

  let user
  try {
    user = await User.findById(req.params.id)
  } catch (error) {
    return res.status(404).json({ message: 'Unable to find user by id.' })
  }

  const fields = {}
  if (req.body.email) fields.email = req.body.email

  const response = await user.update(fields)
  if (response) {
    return res.status(200).json({ message: 'User was updated.' })
  } else {
    return res.status(500).json({ message: 'Failed to update the user.' })
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
    return res.status(200).json({ message: 'User was deleted.' })
  } else {
    return res.status(500).json({ message: 'Failed to delete the user.' })
  }
})
module.exports = router
