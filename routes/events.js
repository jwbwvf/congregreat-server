const express = require('express')
const router = express.Router()

const {
  create,
  getAll,
  getById,
  update,
  softDelete
} = require('../controllers/event')

const event = require('../accessControllers/event')

const { CREATE, READ, READ_ALL, UPDATE, DELETE } = require('../common/actions')

router.get('/', event.canAccess(READ_ALL), getAll)
router.get('/:id', event.canAccess(READ), getById)
router.post('/', event.canAccess(CREATE), create)
router.patch('/:id', event.canAccess(UPDATE), update)
router.delete('/:id', event.canAccess(DELETE), softDelete)

module.exports = router
