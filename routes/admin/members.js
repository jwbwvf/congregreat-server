const express = require('express')
const router = express.Router()
const uuid = require('uuid/v4')
const {Member} = require('../../models')
const {MEMBER_STATUS} = require('../../common/status')

/**
 * Get all members across all congregations.
 */
router.get('/', async function (req, res, next) {
  let members
  try {
    members = await Member.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email']
    })
  } catch (error) {
    return res.status(404).json({ message: 'Unable to find all members.' })
  }

  return res.status(200).json(members)
})

/**
 * Get a member by id.
 */
router.get('/:id', async function (req, res, next) {
  try {
    const member = await Member.findById(req.params.id, {
      attributes: ['id', 'email', 'firstName', 'lastName', 'congregationId', 'status']
    })
    return res.status(200).json(member)
  } catch (error) {
    return res.status(404).json({ message: 'Unable to find member by id.' })
  }
})

/**
 * Get all members of a congregation.
 */
router.get('/congregations/:id', async function (req, res, next) {
  let members
  try {
    members = await Member.findAll({
      where: { congregationId: req.params.id },
      attributes: ['id', 'firstName', 'lastName', 'email']
    })
  } catch (error) {
    return res.status(404).json({ message: 'Unable to find all members of the congregation.' })
  }

  return res.status(200).json(members)
})

/**
 * Add a member.
 * firstName, lastName, email, and congregationId are required.
 * Returns an error if the member already exists(email).
 */
router.post('/', async function (req, res, next) {
  if (!req.body.firstName ||
    !req.body.lastName ||
    !req.body.email) {
    return res.status(409).json({ message: 'All fields are required.' })
  }

  if (!req.body.congregationId) {
    return res.status(409).json({ message: 'All members must be added to a congregation. Congregation id is missing.' })
  }

  const memberFound = await Member.findOne({ where: { email: req.body.email } })
  if (memberFound) {
    return res.status(409).json({ message: 'A member already exists with this email.' })
  }

  try {
    const id = uuid()
    const status = MEMBER_STATUS.ACTIVE
    const { email, firstName, lastName, congregationId } = req.body
    const member = await Member.create({id, email, firstName, lastName, status, congregationId})

    return res.status(200).json({ message: `Member ${member.firstName} ${member.lastName} was added.` })
  } catch (error) {
    return res.status(409).json({ message: 'Unable to create member.' })
  }
})

/**
 * Update a member by id.
 */
router.patch('/:id', async function (req, res, next) {
  if (!req.body.firstName &&
      !req.body.lastName &&
      !req.body.email) {
    return res.status(500).json({ message: 'No modifiable member property was provided.' })
  }

  let member
  try {
    member = await Member.findById(req.params.id)
  } catch (error) {
    return res.status(404).json({ message: 'Unable to find member by id.' })
  }

  const fields = {}
  if (req.body.firstName) fields.firstName = req.body.firstName
  if (req.body.lastName) fields.lastName = req.body.lastName
  if (req.body.email) fields.email = req.body.email

  const response = await member.update(fields)
  if (response) {
    return res.status(200).json({ message: 'Member was updated.' })
  } else {
    return res.status(500).json({ message: 'Failed to update the member.' })
  }
})

/**
 * Delete member by id.
 * Soft delete.
 */
router.delete('/:id', async function (req, res, next) {
  let member
  try {
    member = await Member.findById(req.params.id)
  } catch (error) {
    return res.status(404).json({ message: 'Unable to find member by id.' })
  }

  const response = await member.update({ status: MEMBER_STATUS.DELETED })
  if (response) {
    return res.status(200).json({ message: 'Member was deleted.' })
  } else {
    return res.status(500).json({ message: 'Failed to delete the member.' })
  }
})
module.exports = router
