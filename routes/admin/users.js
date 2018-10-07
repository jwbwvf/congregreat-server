const express = require('express')
const router = express.Router()

const {
  findAll,
  find,
  update,
  softDelete
} = require('../../controllers/user')

router.get('/', findAll)
router.get('/:id', find)
router.patch('/:id', update)
router.delete('/:id', softDelete)

module.exports = router
