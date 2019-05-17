const express = require('express')
const router = express.Router()
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

const {
  create,
  getAll,
  getById,
  getByCongregationId,
  update,
  softDelete,
  uploadProfilePic
} = require('../controllers/member')

router.get('/', getAll)
router.get('/:id', getById)
router.get('/congregations/:id', getByCongregationId)
router.post('/', create)
router.patch('/:id', update)
router.delete('/:id', softDelete)
router.post('/profile/pic', upload.single('profilePic'), uploadProfilePic)

module.exports = router
