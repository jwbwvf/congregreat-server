var express = require('express')
var router = express.Router()

const {
  create,
  getAll,
  getById,
  update,
  softDelete
} = require('../controllers/congregation')

const { canAccess } = require('../accessControllers/congregation')
const { CREATE, READ, UPDATE, DELETE } = require('../common/actions')

router.post('/', canAccess(CREATE), create)
router.get('/', canAccess(READ), getAll)
router.get('/:id', canAccess(READ), getById)
router.patch('/:id', canAccess(UPDATE), update)
router.delete('/:id', canAccess(DELETE), softDelete)

module.exports = router
