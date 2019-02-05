const express = require('express')
const router = express.Router()
const {
  getAll,
  getById,
  create,
  softDelete
} = require('../controllers/userRole')

router.get('/', getAll)
router.get('/:id', getById)
router.post('/', create)
router.delete('/:id', softDelete)

module.exports = router
