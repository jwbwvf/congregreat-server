/* global describe it beforeEach afterEach */

const { CREATE, READ, UPDATE, DELETE } = require('../../common/actions')
const { canAccess } = require('../../accessControllers/congregation')
const faker = require('faker')
const sinon = require('sinon')
const chai = require('chai')

const expect = chai.expect

describe('congregation', function () {
  describe('canAccess', function () {
    let sandbox, req, resStub, nextSpy, userId, congregationId, permissions, systemAdmin, consoleStub
    beforeEach(function () {
      sandbox = sinon.sandbox.create()
      nextSpy = sandbox.spy()
      resStub = sandbox.stub()
      resStub.status = sandbox.stub()
      resStub.status.returns(resStub)
      resStub.json = sandbox.stub()
      resStub.json.returns(resStub)
      consoleStub = sandbox.stub(console, 'log')

      userId = faker.random.number()
      congregationId = faker.random.number()
      permissions = { entities: [] }
      req = { user: { id: userId, congregationId, permissions, systemAdmin } }
    })
    afterEach(function () {
      sandbox.restore()
    })
    it('gives system admin access to any congregation for any action', function () {
      req.params = { id: faker.random.number() }
      req.user.systemAdmin = true
      canAccess(CREATE)(req, resStub, nextSpy)
      expect(nextSpy.calledOnce).to.equal(true)
    })
    it('prevents a non member of the congregation to take any action', function () {
      req.params = { id: faker.random.number() }
      canAccess(READ)(req, resStub, nextSpy)
      expect(nextSpy.called).to.equal(false)
      expect(consoleStub.calledWith(`User ${userId} is not a member of congregation ${req.params.id} and tried to ${READ} the congregation.`)).to.equal(true)
      expect(resStub.status.calledWith(401)).to.equal(true)
      expect(resStub.json.calledWith({ message: `Not authorized to ${READ} this congregation.` })).to.equal(true)
    })
    it('gives any member of the congregation read access', function () {
      req.params = { id: congregationId }
      canAccess(READ)(req, resStub, nextSpy)
      expect(nextSpy.calledOnce).to.equal(true)
    })
    it('gives any member of the congregation any action they have permission for', function () {
      const entities = [{
        name: 'congregation',
        actions: ['create', 'read', 'update']
      }]
      req.user.permissions = {entities}
      req.params = { id: congregationId }
      canAccess(UPDATE)(req, resStub, nextSpy)
      expect(nextSpy.calledOnce).to.equal(true)
    })
    it('logs the user and the action being attempted for a user that does not have permission to take the action on the congregation', function () {
      const entities = [{
        name: 'congregation',
        actions: ['create', 'read', 'update']
      }]
      req.user.permissions = {entities}
      req.params = { id: congregationId }
      canAccess(DELETE)(req, resStub, nextSpy)
      expect(nextSpy.calledOnce).to.equal(false)
      expect(consoleStub.calledWith(`User ${userId} tried to ${DELETE} congregation ${req.params.id}.`)).to.equal(true)
      expect(resStub.status.calledWith(401)).to.equal(true)
      expect(resStub.json.calledWith({ message: `Not authorized to ${DELETE} this congregation.` })).to.equal(true)
    })
    it('logs the user and the action being attempted for a user that does not have permission to the congregation entity', function () {
      const entities = [{
        name: 'member',
        actions: ['create', 'read', 'update']
      }]
      req.user.permissions = {entities}
      req.params = { id: congregationId }
      canAccess(CREATE)(req, resStub, nextSpy)
      expect(nextSpy.calledOnce).to.equal(false)
      expect(consoleStub.calledWith(`User ${userId} tried to ${CREATE} congregation ${req.params.id}.`)).to.equal(true)
      expect(resStub.status.calledWith(401)).to.equal(true)
      expect(resStub.json.calledWith({ message: `Not authorized to ${CREATE} this congregation.` })).to.equal(true)
    })
  })
})
