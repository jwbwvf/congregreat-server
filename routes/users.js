const express = require('express')
const router = express.Router()

const {
  getAll,
  getById,
  update,
  softDelete
} = require('../controllers/user')

router.get('/', getAll)
router.get('/:id', getById)
router.patch('/:id', update)
router.delete('/:id', softDelete)

module.exports = router
