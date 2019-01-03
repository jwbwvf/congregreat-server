var express = require('express')
var router = express.Router()

const {
  create,
  getAll,
  getById,
  update,
  softDelete
} = require('../controllers/congregation')

router.post('/', create)
router.get('/', getAll)
router.get('/:id', getById)
router.patch('/:id', update)
router.delete('/:id', softDelete)

module.exports = router
