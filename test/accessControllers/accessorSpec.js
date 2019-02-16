/* global describe it */

const accessor = require('../../accessControllers/accessor')
const { expect } = require('chai')

describe('accessor', function () {
  describe('isSystemAdmin', function () {
    it('should return false if the permissions do not contain the entity name * and actions *', function () {
      const permissions = {
        'entities': [
          {
            'name': 'member',
            'actions': [
              'create',
              'read',
              'update'
            ]
          },
          {
            'name': 'attendance',
            'actions': [
              'read'
            ]
          }
        ]
      }

      expect(accessor.isSystemAdmin(permissions)).to.equal(false)
    })
    it('should return true if it the permissions do not contain the entity name * and actions *', function () {
      const permissions = {
        'entities': [
          {
            'name': '*',
            'actions': [
              '*'
            ]
          }
        ]
      }

      expect(accessor.isSystemAdmin(permissions)).to.equal(true)
    })
    it('should return false if there are no entities on the permissions', function () {
      const permissions = {}

      expect(accessor.isSystemAdmin(permissions)).to.equal(false)
    })
  })
})
