'use strict'

const ACTIVE = 'active'
const DELETED = 'deleted'
const NEW = 'new'
const REGISTERED = 'registered'
const UNVERIFIED = 'unVerified'
const VERIFIED = 'verified'

const USER_STATUS = {
  VERIFIED,
  UNVERIFIED,
  DELETED
}

const CONGREGATION_STATUS = {
  NEW,
  DELETED
}

const MEMBER_STATUS = {
  REGISTERED,
  DELETED,
  ACTIVE
}

const ROLE_STATUS = {
  NEW,
  DELETED
}

module.exports = {
  USER_STATUS,
  CONGREGATION_STATUS,
  MEMBER_STATUS,
  ROLE_STATUS
}
