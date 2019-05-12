const express = require('express')
const router = express.Router()

router.use('/congregations', require('./congregations'))
router.use('/users', require('./users'))
router.use('/members', require('./members'))
router.use('/attendances', require('./attendances'))
router.use('/roles', require('./roles'))
router.use('/user-roles', require('./userRoles'))
router.use('/events', require('./events'))

module.exports = router
