'use strict'
/*
  These are the different data objects that are persistant.
  These are hard coded to ensure permissions are only granted
  for types that exist.
*/
const ATTENDANCE = 'attendance'
const CONGREGATION = 'congregation'
const MEMBER = 'member'
const ROLE = 'role'
const USER = 'user'
const USER_ROLE = 'userRole'

const entities = [
  ATTENDANCE,
  CONGREGATION,
  MEMBER,
  ROLE,
  USER,
  USER_ROLE
]
module.exports = {
  entities,
  ATTENDANCE,
  CONGREGATION,
  MEMBER,
  ROLE,
  USER,
  USER_ROLE
}
