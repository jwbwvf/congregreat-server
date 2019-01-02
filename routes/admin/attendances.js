const express = require('express')
const router = express.Router()

const {
  create,
  destroy
} = require('../../controllers/attendance')

router.post('/', create)
router.delete('/:id', destroy)

module.exports = router
