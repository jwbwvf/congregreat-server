'use strict'

const ACTIVE = 'active'
const DELETED = 'deleted'
const NEW = 'new'
const REGISTERED = 'registered'
const UNVERIFIED = 'unVerified'
const VERIFIED = 'verified'
const EXPIRED = 'expired'

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

const USER_ROLE_STATUS = {
  NEW,
  DELETED
}

const EVENT_STATUS = {
  NEW,
  DELETED,
  EXPIRED
}

module.exports = {
  USER_STATUS,
  USER_ROLE_STATUS,
  CONGREGATION_STATUS,
  MEMBER_STATUS,
  ROLE_STATUS,
  EVENT_STATUS
}
