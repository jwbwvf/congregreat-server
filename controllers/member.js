'use strict'

const uuid = require('uuid')
const { Member } = require('../models')
const { MEMBER_STATUS } = require('../common/status')
const photoService = require('../services/photoService')

const create = async (req, res) => {
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
    const id = uuid.v4()
    const status = MEMBER_STATUS.ACTIVE
    const { email, firstName, lastName, congregationId } = req.body
    const member = await Member.create({ id, email, firstName, lastName, status, congregationId })

    return res.status(200).json({ message: `Member ${member.firstName} ${member.lastName} was added.` })
  } catch (error) {
    return res.status(409).json({ message: 'Unable to create member.' })
  }
}

const getAll = async (req, res) => {
  try {
    const members = await Member.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'congregationId', 'status']
    })
    return res.status(200).json(members)
  } catch (error) {
    return res.status(404).json({ message: 'Unable to find all members.' })
  }
}

const getById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id, {
      attributes: ['id', 'email', 'firstName', 'lastName', 'congregationId', 'status']
    })
    return res.status(200).json(member)
  } catch (error) {
    return res.status(404).json({ message: 'Unable to find member by id.' })
  }
}

const getByCongregationId = async (req, res) => {
  try {
    const members = await Member.findAll({
      where: { congregationId: req.params.id },
      attributes: ['id', 'firstName', 'lastName', 'email']
    })
    return res.status(200).json(members)
  } catch (error) {
    return res.status(404).json({ message: 'Unable to find all members of the congregation.' })
  }
}

const update = async (req, res) => {
  if (!req.body.firstName && !req.body.lastName && !req.body.email) {
    return res.status(500).json({ message: 'No modifiable member property was provided.' })
  }

  try {
    const options = { where: { id: req.params.id } }
    const fields = {}
    if (req.body.firstName) fields.firstName = req.body.firstName
    if (req.body.lastName) fields.lastName = req.body.lastName
    if (req.body.email) fields.email = req.body.email

    await Member.update(fields, options)
    return res.status(200).json({ message: 'Member was updated.' })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update the member.' })
  }
}
const softDelete = async (req, res) => {
  try {
    const fields = { status: MEMBER_STATUS.DELETED }
    const options = { where: { id: req.params.id } }

    await Member.update(fields, options)
    return res.status(200).json({ message: 'Member was deleted.' })
  } catch (error) {
    return res.status(500).json({ message: 'Unable to delete the member.' })
  }
}

// This is for the user to upload their profile pic.
// There will be a different route that is for an admin to upload pics for users.
const uploadProfilePic = async (req, res) => {
  const { congregationId, memberId } = req.user
  try {
    const { path } = req.file
    photoService.upload(congregationId, memberId, path)
  } catch (error) {
    console.error(error, { congregationId, memberId })
    return res.send({ message: 'Unable to upload profile pic' }, 409)
  }
  return res.send(200)
}

const getProfilePic = (req, res) => {
  const { congregationId, memberId } = req.user
  try {
    photoService.download(congregationId, memberId, res)
  } catch (error) {
    console.error(error, { congregationId, memberId })
    return res.send({ message: 'Unable to download the profile pic' })
  }
  // no return because the photoService takes the res and when it gets a response from s3 it puts it on the res
}

module.exports = {
  create,
  getAll,
  getById,
  getByCongregationId,
  update,
  softDelete,
  uploadProfilePic,
  getProfilePic
}
