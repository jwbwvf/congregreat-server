const express = require('express')
const router = express.Router()

const {
  create,
  getAll,
  getById,
  getByCongregationId,
  update,
  softDelete
} = require('../../controllers/member')

/**
 * Get all members across all congregations.
 */
router.get('/', getAll)

/**
 * Get a member by id.
 */
router.get('/:id', getById)

/**
 * Get all members of a congregation.
 */
router.get('/congregations/:id', getByCongregationId)

/**
 * Add a new member.
 * firstName, lastName, email, and congregationId are required.
 * Returns an error if the member already exists(email).
 */
router.post('/', create)

/**
 * Update a member by id.
 */
router.patch('/:id', update)

/**
 * Delete member by id.
 * Soft delete.
 */
router.delete('/:id', softDelete)

module.exports = router
