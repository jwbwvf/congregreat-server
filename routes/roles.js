const express = require('express')
const router = express.Router()
const {
  getAll,
  getById,
  create,
  update,
  softDelete
} = require('../controllers/role')

router.get('/', getAll)
router.get('/:id', getById)
router.post('/', create)
router.patch('/:id', update)
router.delete('/:id', softDelete)

module.exports = router
