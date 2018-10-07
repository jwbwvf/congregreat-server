var express = require('express')
var router = express.Router()

const {
  create,
  findAll,
  find,
  update,
  softDelete
} = require('../../controllers/congregation')

router.post('/', create)
router.get('/', findAll)
router.get('/:id', find)
router.patch('/:id', update)
router.delete('/:id', softDelete)

module.exports = router
