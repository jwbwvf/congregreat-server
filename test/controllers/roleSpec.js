/* global describe it beforeEach afterEach */

const {
  getAll,
  getById,
  create,
  update,
  softDelete
} = require('../../controllers/role')
const Role = require('../../models').Role
const { ROLE_STATUS } = require('../../common/status')
const sinon = require('sinon')
const faker = require('faker')
const chai = require('chai')

const expect = chai.expect

describe('role', function () {
  let sandbox, errorStub, logStub, req, resStub, roles
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

    roles = [
      {
        id: faker.random.uuid(),
        name: faker.random.word(),
        permissions: {
          entities: [
            {
              name: 'member',
              actions: [
                'create',
                'read',
                'update',
                'delete'
              ]
            },
            {
              name: 'attendance',
              actions: [
                'create',
                'read',
                'update',
                'delete'
              ]
            }
          ]
        },
        status: 'new'
      },
      {
        id: faker.random.uuid(),
        name: faker.random.word(),
        permissions: {
          entities: [
            {
              name: 'congregation',
              actions: [
                'create',
                'read',
                'update',
                'delete'
              ]
            },
            {
              name: 'user',
              actions: [
                'read'
              ]
            },
            {
              name: 'userRole',
              actions: [
                'create',
                'read',
                'update'
              ]
            }
          ]
        },
        status: 'new'
      }
    ]
  })
  afterEach(function () {
    sandbox.restore()
  })
  describe('getAll', function () {
    it('should get all roles', async function () {
      sandbox.stub(Role, 'findAll').resolves(roles)

      await getAll(req, resStub)
      expect(resStub.status.getCall(0).calledWith(200)).to.equal(true)
      expect(resStub.json.getCall(0).calledWith(roles)).to.equal(true)
    })
    it('should return an error if one is caught', async function () {
      const errorMessage = faker.random.words()
      const error = new Error(errorMessage)
      sandbox.stub(Role, 'findAll').throws(error)

      await getAll(req, resStub)
      expect(errorStub.getCall(0).calledWith(error)).to.equal(true)
      expect(resStub.status.getCall(0).calledWith(404)).to.equal(true)
      expect(resStub.json.getCall(0).calledWith({ message: 'Unable to find all roles.' })).to.equal(true)
    })
  })
  describe('getById', async function () {
    it('should get the role for a given id', async function () {
      sandbox.stub(Role, 'findById').withArgs(roles[0].id).resolves(roles[0])

      req.params = { id: roles[0].id }

      await getById(req, resStub)
      expect(resStub.status.getCall(0).calledWith(200)).to.equal(true)
      expect(resStub.json.getCall(0).calledWith(roles[0])).to.equal(true)
    })
    it('should return an error if one is caught', async function () {
      const errorMessage = faker.random.words()
      const error = new Error(errorMessage)
      sandbox.stub(Role, 'findById').throws(error)

      req.params = { id: faker.random.number() }

      await getById(req, resStub)
      expect(errorStub.getCall(0).calledWith(error)).to.equal(true)
      expect(resStub.status.getCall(0).calledWith(404)).to.equal(true)
      expect(resStub.json.getCall(0).calledWith({ message: 'Unable to find role by id.' })).to.equal(true)
    })
  })
  describe('create', async function () {
    it('should create a new role', async function () {
      const role = {
        name: faker.random.word()
      }
      sandbox.stub(Role, 'create').resolves(role)

      req.user = { id: faker.random.number() }
      req.params = { id: roles[0].id }
      req.body = {
        name: role.name,
        permissions: {
          entities: [{
            name: 'congregation',
            actions: [
              'read'
            ]}
          ]
        }
      }

      await create(req, resStub)
      expect(resStub.status.getCall(0).calledWith(200)).to.equal(true)
      expect(resStub.json.getCall(0).calledWith({ message: `Role ${role.name} was created.` }))
    })
    it('should return an error if the required fields are not on the body', async function () {
      req.user = { id: faker.random.uuid() }

      await create(req, resStub)
      expect(resStub.status.getCall(0).calledWith(409)).to.equal(true)
      expect(resStub.json.getCall(0).calledWith({ message: 'Name and permissions are required fields.' })).to.equal(true)
      expect(logStub.getCall(0).calledWith(`User ${req.user.id} tried to create a role without the required fields. ${JSON.stringify(req.body)}`)).to.equal(true)
    })
    it('should return an error if one is caught', async function () {
      const errorMessage = faker.random.words()
      const error = new Error(errorMessage)
      sandbox.stub(Role, 'create').throws(error)

      req.body = {
        name: faker.random.words(),
        permissions: {
          entities: [{
            name: 'attendance', actions: ['read']
          }]
        }
      }
      req.user = { id: faker.random.number() }

      await create(req, resStub)
      expect(errorStub.getCall(0).calledWith(error)).to.equal(true)
      expect(resStub.status.getCall(0).calledWith(409)).to.equal(true)
      expect(resStub.json.getCall(0).calledWith({ message: 'Unable to create role.' })).to.equal(true)
    })
    it('should return an error if there are no entities on the permissions', async function () {
      req.body = {
        name: faker.random.words(),
        permissions: {}
      }
      req.user = { id: faker.random.number() }

      await create(req, resStub)
      expect(errorStub.getCall(0).args[0].message).to.eql('The permissions are invalid since they do not contain any entities.')
      expect(resStub.status.getCall(0).calledWith(409)).to.equal(true)
      expect(resStub.json.getCall(0).calledWith({ message: 'Unable to create role.' })).to.equal(true)
    })
    it('should return an error if there is an invalid entity on the permissions', async function () {
      const invalidEntityName = 'invalidEntity' // not using faker just in case it were to randomly pick a valid entity name
      req.body = {
        name: faker.random.words(),
        permissions: {
          entities: [{
            name: invalidEntityName,
            actions: ['read']
          }]
        }
      }
      req.user = { id: faker.random.number() }

      await create(req, resStub)
      expect(errorStub.getCall(0).args[0].message).to.eql(`The permissions are invalid since it includes an invalid entity: ${invalidEntityName}`)
      expect(resStub.status.getCall(0).calledWith(409)).to.equal(true)
      expect(resStub.json.getCall(0).calledWith({ message: 'Unable to create role.' })).to.equal(true)
    })
    it('should return an error if there are no actions on the entity on the permissions', async function () {
      const entityName = 'attendance'
      req.body = {
        name: faker.random.words(),
        permissions: {
          entities: [{
            name: entityName,
            actions: []
          }]
        }
      }
      req.user = { id: faker.random.number() }

      await create(req, resStub)
      expect(errorStub.getCall(0).args[0].message).to.eql(`The permissions are invalid since there are no actions on the entity: ${entityName}`)
      expect(resStub.status.getCall(0).calledWith(409)).to.equal(true)
      expect(resStub.json.getCall(0).calledWith({ message: 'Unable to create role.' })).to.equal(true)
    })
    it('should return an error if there is an invalid action on the entities on the permissions', async function () {
      const entityName = 'attendance'
      const invalidAction = 'doSomething'
      req.body = {
        name: faker.random.words(),
        permissions: {
          entities: [{
            name: entityName,
            actions: [invalidAction]
          }]
        }
      }
      req.user = { id: faker.random.number() }

      await create(req, resStub)
      expect(errorStub.getCall(0).args[0].message).to.eql(`The permissions are invalid since ${entityName} has an invalid action: ${invalidAction}`)
      expect(resStub.status.getCall(0).calledWith(409)).to.equal(true)
      expect(resStub.json.getCall(0).calledWith({ message: 'Unable to create role.' })).to.equal(true)
    })
  })
  describe('update', async function () {
    it('should update an existing role', async function () {
      sandbox.stub(Role, 'update').resolves([1])

      req.user = { id: faker.random.number() }
      req.params = { id: roles[0].id }
      req.body = {
        permissions: {
          entities: [{
            name: 'congregation',
            actions: [
              'read'
            ]}
          ]
        }
      }
      await update(req, resStub)
      expect(resStub.status.getCall(0).calledWith(200)).to.equal(true)
      expect(resStub.json.getCall(0).calledWith({ message: 'Role was updated.' })).to.equal(true)
    })
    it('should return an error if it fails to update the role', async function () {
      sandbox.stub(Role, 'update').resolves([0])

      req.user = { id: faker.random.number() }
      req.params = { id: roles[0].id }
      req.body = {
        permissions: {
          entities: [{
            name: 'congregation',
            actions: [
              'read'
            ]}
          ]
        }
      }
      await update(req, resStub)
      expect(resStub.status.getCall(0).calledWith(500)).to.equal(true)
      expect(resStub.json.getCall(0).calledWith({ message: 'Unable to update the role.' })).to.equal(true)
      const fields = {updatedBy: req.user.id, permissions: req.body.permissions}
      const options = {where: {id: req.params.id}}
      expect(logStub.getCall(0).calledWith(`Failed to update the role with the following fields: ${JSON.stringify(fields)} and options: ${JSON.stringify(options)}`)).to.equal(true)
    })
    it('should return an error if no modifiable property was provided', async function () {
      req.user = { id: faker.random.uuid() }
      await update(req, resStub)
      expect(resStub.status.getCall(0).calledWith(500)).to.equal(true)
      expect(resStub.json.getCall(0).calledWith({ message: 'No modifiable role property was provided.' })).to.equal(true)
      console.log(`User ${req.user.id} tried to update a role without a modifiable property. ${JSON.stringify(req.body)}`)
    })
    it('should return an error if one is caught', async function () {
      const errorMessage = faker.random.words()
      const error = new Error(errorMessage)
      sandbox.stub(Role, 'update').throws(error)

      req.body = {
        name: faker.random.words(),
        permissions: {
          entities: [{
            name: 'attendance', actions: ['read']
          }]
        }
      }
      req.user = { id: faker.random.number() }
      req.params = { id: faker.random.number() }

      await update(req, resStub)
      expect(errorStub.getCall(0).calledWith(error)).to.equal(true)
      expect(resStub.status.getCall(0).calledWith(500)).to.equal(true)
      expect(resStub.json.getCall(0).calledWith({ message: 'Unable to update the role.' })).to.equal(true)
    })
  })
  describe('softDelete', async function () {
    it('should set the status of the role as deleted', async function () {
      const updateStub = sandbox.stub(Role, 'update')
      req.params = { id: roles[0].id }

      await softDelete(req, resStub)
      expect(updateStub.getCall(0).calledWith({ status: ROLE_STATUS.DELETED }, { where: { id: roles[0].id } })).to.equal(true)
      expect(resStub.status.getCall(0).calledWith(200)).to.equal(true)
      expect(resStub.json.getCall(0).calledWith({ message: 'Role was deleted.' })).to.equal(true)
    })
    it('should return an error if one is caught', async function () {
      const errorMessage = faker.random.words()
      const error = new Error(errorMessage)
      sandbox.stub(Role, 'update').throws(error)

      req.params = { id: faker.random.number() }

      await softDelete(req, resStub)
      expect(errorStub.getCall(0).calledWith(error)).to.equal(true)
      expect(resStub.status.getCall(0).calledWith(500)).to.equal(true)
      expect(resStub.json.getCall(0).calledWith({ message: 'Unable to delete the role.' })).to.equal(true)
    })
  })
})
