const express = require('express')
const router = express.Router()

const {
  create,
  getAll,
  getById,
  update,
  softDelete
} = require('../controllers/congregation')

const congregation = require('../accessControllers/congregation')
const { CREATE, READ, UPDATE, DELETE } = require('../common/actions')

router.post('/', congregation.canAccess(CREATE), create)
router.get('/', congregation.canAccess(READ), getAll)
router.get('/:id', congregation.canAccess(READ), getById)
router.patch('/:id', congregation.canAccess(UPDATE), update)
router.delete('/:id', congregation.canAccess(DELETE), softDelete)

module.exports = router
