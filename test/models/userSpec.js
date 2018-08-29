/* global describe it */

const User = require('../../models').User
const {USER_STATUS} = require('../../common/status')
const chai = require('chai')
const assert = chai.assert

describe('User', function () {
  describe('isVerified', function () {
    it('returns true if the users status is verified', function () {
      const user = new User()
      user.status = USER_STATUS.VERIFIED

      assert(user.isVerified())
    })
    it('returns false if the users status is not verified', function () {
      const user = new User()
      user.status = USER_STATUS.UNVERIFIED

      assert(!user.isVerified())
    })
  })
})
