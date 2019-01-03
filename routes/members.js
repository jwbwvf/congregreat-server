const express = require('express')
const router = express.Router()

const {
  create,
  getAll,
  getById,
  getByCongregationId,
  update,
  softDelete
} = require('../controllers/member')

router.get('/', getAll)
router.get('/:id', getById)
router.get('/congregations/:id', getByCongregationId)
router.post('/', create)
router.patch('/:id', update)
router.delete('/:id', softDelete)

module.exports = router
