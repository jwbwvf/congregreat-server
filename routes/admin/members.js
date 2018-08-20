const express = require('express')
const router = express.Router()
const uuid = require('uuid/v4')
const Member = require('../../models').Member
const {MEMBER_STATUS} = require('../../common/status')

/**
 * Get all members across all congregations.
 */
router.get('/', async function (req, res, next) {
  let members
  try {
    members = await Member.findAll({
      attributes: ['id', 'first_name', 'last_name', 'email']
    })
  } catch (error) {
    res.status(404).json({ message: 'Unable to find all members.' })
  }
  res.status(200).json(members)
})

/**
 * Get a member by id.
 */
router.get('/:id', async function (req, res, next) {
  try {
    const member = await Member.findById(req.params.id, {
      attributes: ['id', 'email', 'first_name', 'last_name', 'congregation_id', 'status']
    })
    res.status(200).json(member)
  } catch (error) {
    res.status(404).json({ message: 'Unable to find member by id.' })
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
      attributes: ['id', 'first_name', 'last_name', 'email']
    })
  } catch (error) {
    res.status(404).json({ message: 'Unable to find all members of the congregation.' })
  }
  res.status(200).json(members)
})

/**
 * Add a member.
 * first_name, last_name, email, and congregation_id are required.
 * Returns an error if the member already exists(email).
 */
router.post('/', async function (req, res, next) {
  if (!req.body.first_name ||
    !req.body.last_name ||
    !req.body.email) {
    return res.status(409).json({ message: 'All fields are required.' })
  }

  if (!req.body.congregation_id) {
    return res.status(409).json({ message: 'All members must be added to a congregation. Congregation id is missing.' })
  }

  const memberFound = await Member.findOne({ where: { email: req.body.email } })
  if (memberFound) {
    return res.status(409).json({ message: 'A member already exists with this email.' })
  }

  try {
    const id = uuid()
    const email = req.body.email
    const firstName = req.body.first_name
    const lastName = req.body.last_name
    const status = MEMBER_STATUS.ACTIVE
    const congregationId = req.body.congregation_id
    const member = await Member.create({id, email, firstName, lastName, status, congregationId})

    res.status(200).json({ message: `Member ${member.firstName} ${member.lastName} was added.` })
  } catch (error) {
    res.status(409).json({ message: 'Unable to create member.' })
  }
})

/**
 * Update a member by id.
 */
router.patch('/:id', async function (req, res, next) {
  if (!req.body.first_name &&
      !req.body.last_name &&
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
  if (req.body.first_name) fields.firstName = req.body.first_name
  if (req.body.last_name) fields.lastName = req.body.last_name
  if (req.body.email) fields.email = req.body.email

  const response = await member.update(fields)
  if (response) {
    res.status(200).json({ message: 'Member was updated.' })
  } else {
    res.status(500).json({ message: 'Failed to update the member.' })
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
    res.status(200).json({ message: 'Member was deleted.' })
  } else {
    res.status(500).json({ message: 'Failed to delete the member.' })
  }
})
module.exports = router
