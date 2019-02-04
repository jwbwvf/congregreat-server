/* global describe it beforeEach afterEach */

const {
  getAll,
  getById,
  create,
  softDelete
} = require('../../controllers/userRole')
const UserRole = require('../../models').UserRole
const { USER_ROLE_STATUS } = require('../../common/status')
const sinon = require('sinon')
const faker = require('faker')
const chai = require('chai')

const expect = chai.expect

describe('userRole', function () {
  let sandbox, errorStub, logStub, req, resStub, userRoles, userId
  beforeEach(function () {
    sandbox = sinon.sandbox.create()
    errorStub = sandbox.stub(console, 'error')
    logStub = sandbox.stub(console, 'log')
    resStub = sandbox.stub()
    resStub.status = sandbox.stub()
    resStub.status.returns(resStub)
    resStub.json = sandbox.stub()
    resStub.json.returns(resStub)
    req = {}

    userId = faker.random.uuid()
    userRoles = [
      {
        id: faker.random.uuid(),
        userId,
        roleId: faker.random.uuid(),
        status: USER_ROLE_STATUS.NEW
      },
      {
        id: faker.random.uuid(),
        userId,
        roleId: faker.random.uuid(),
        status: USER_ROLE_STATUS.NEW
      }
    ]
  })
  afterEach(function () {
    sandbox.restore()
  })
  describe('getAll', function () {
    it('should get all user roles', async function () {
      sandbox.stub(UserRole, 'findAll').resolves(userRoles)

      await getAll(req, resStub)
      expect(resStub.status.getCall(0).calledWith(200)).to.equal(true)
      expect(resStub.json.getCall(0).calledWith(userRoles)).to.equal(true)
    })
    it('should return an error if one is caught', async function () {
      const errorMessage = faker.random.words()
      const error = new Error(errorMessage)
      sandbox.stub(UserRole, 'findAll').throws(error)

      await getAll(req, resStub)
      expect(errorStub.getCall(0).calledWith(error)).to.equal(true)
      expect(resStub.status.getCall(0).calledWith(404)).to.equal(true)
      expect(resStub.json.getCall(0).calledWith({ message: 'Unable to find all userRoles.' })).to.equal(true)
    })
  })
  describe('getById', async function () {
    it('should get the user role for a given id', async function () {
      sandbox.stub(UserRole, 'findById').withArgs(userRoles[0].id).resolves(userRoles[0])

      req.params = { id: userRoles[0].id }

      await getById(req, resStub)
      expect(resStub.status.getCall(0).calledWith(200)).to.equal(true)
      expect(resStub.json.getCall(0).calledWith(userRoles[0])).to.equal(true)
    })
    it('should return an error if one is caught', async function () {
      const errorMessage = faker.random.words()
      const error = new Error(errorMessage)
      sandbox.stub(UserRole, 'findById').throws(error)

      req.params = { id: faker.random.number() }

      await getById(req, resStub)
      expect(errorStub.getCall(0).calledWith(error)).to.equal(true)
      expect(resStub.status.getCall(0).calledWith(404)).to.equal(true)
      expect(resStub.json.getCall(0).calledWith({ message: 'Unable to find userRole by id.' })).to.equal(true)
    })
  })
  describe('create', async function () {
    it('should create a new role', async function () {
      req.body = {
        userId: faker.random.uuid(),
        roleId: faker.random.uuid()
      }
      req.user = { id: faker.random.uuid() }

      sandbox.stub(UserRole, 'create')

      await create(req, resStub)
      expect(resStub.status.getCall(0).calledWith(200)).to.equal(true)
      expect(resStub.json.getCall(0).calledWith({ message: `UserRole was created.` }))
    })
    it('should return an error if the required fields are not on the body', async function () {
      req.user = { id: faker.random.uuid() }

      await create(req, resStub)
      expect(resStub.status.getCall(0).calledWith(409)).to.equal(true)
      expect(resStub.json.getCall(0).calledWith({ message: 'userId and roleId are required fields.' })).to.equal(true)
      expect(logStub.getCall(0).calledWith(`User ${req.user.id} tried to create a userRole without the required fields. ${JSON.stringify(req.body)}`)).to.equal(true)
    })
    it('should return an error if one is caught', async function () {
      const errorMessage = faker.random.words()
      const error = new Error(errorMessage)
      sandbox.stub(UserRole, 'create').throws(error)

      req.body = {
        userId: faker.random.uuid(),
        roleId: faker.random.uuid()
      }
      req.user = { id: faker.random.uuid() }

      await create(req, resStub)
      expect(errorStub.getCall(0).calledWith(error)).to.equal(true)
      expect(resStub.status.getCall(0).calledWith(409)).to.equal(true)
      expect(resStub.json.getCall(0).calledWith({ message: 'Unable to create userRole.' })).to.equal(true)
    })
  })
  describe('softDelete', async function () {
    it('should set the status of the role as deleted', async function () {
      const updateStub = sandbox.stub(UserRole, 'update')
      req.params = { id: userRoles[0].id }

      await softDelete(req, resStub)
      expect(updateStub.getCall(0).calledWith({ status: USER_ROLE_STATUS.DELETED }, { where: { id: userRoles[0].id } })).to.equal(true)
      expect(resStub.status.getCall(0).calledWith(200)).to.equal(true)
      expect(resStub.json.getCall(0).calledWith({ message: 'UserRole was deleted.' })).to.equal(true)
    })
    it('should return an error if one is caught', async function () {
      const errorMessage = faker.random.words()
      const error = new Error(errorMessage)
      sandbox.stub(UserRole, 'update').throws(error)

      req.params = { id: faker.random.number() }

      await softDelete(req, resStub)
      expect(errorStub.getCall(0).calledWith(error)).to.equal(true)
      expect(resStub.status.getCall(0).calledWith(500)).to.equal(true)
      expect(resStub.json.getCall(0).calledWith({ message: 'Unable to delete userRole.' })).to.equal(true)
    })
  })
})
