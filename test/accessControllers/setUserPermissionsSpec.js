/* global describe it beforeEach afterEach */

const { setUserPermissions } = require('../../accessControllers/setUserPermissions')
const sinon = require('sinon')
const Role = require('../../models').Role
const chai = require('chai')
const expect = chai.expect

describe('setUserPermissions', function () {
  let sandbox, roles, req, res, nextSpy
  beforeEach(function () {
    sandbox = sinon.sandbox.create()
    req = { user: { roleIds: ['1'] } }
    res = { }

    nextSpy = sandbox.spy()
  })
  afterEach(function () {
    sandbox.restore()
  })
  it('sets the users permissions on the request', async function () {
    roles = [{
      name: 'user manager',
      permissions: {
        entities: [
          {name: 'user', actions: ['create', 'read', 'update', 'delete']},
          {name: 'userRole', actions: ['create', 'read', 'update', 'delete']}
        ]
      }
    }, {
      name: 'member',
      permissions: {
        entities: [
          {name: 'member', actions: ['read']}
        ]
      }
    }]

    sandbox.stub(Role, 'findAll').resolves(roles)

    await setUserPermissions(req, res, nextSpy)
    expect(nextSpy.called).to.equal(true)
    expect(req.user.systemAdmin).to.equal(undefined)
    expect(req.user.permissions).to.eql(
      {
        entities: [
          {name: 'user', actions: ['create', 'read', 'update', 'delete']},
          {name: 'userRole', actions: ['create', 'read', 'update', 'delete']},
          {name: 'member', actions: ['read']}
        ]
      }
    )
  })
  it('sets if the user is a system admin on the request', async function () {
    roles = [{
      name: 'system admin',
      permissions: {
        entities: [
          {name: 'user', actions: ['create', 'read', 'update', 'delete']}
        ]
      }
    }]

    sandbox.stub(Role, 'findAll').resolves(roles)

    await setUserPermissions(req, res, nextSpy)
    expect(nextSpy.called).to.equal(true)
    expect(req.user.systemAdmin).to.equal(true)
  })
  it('returns unauthorized if there are any erros while trying to get the users permissions', async function () {
    sandbox.stub(Role, 'findAll').throws(new Error())
    sandbox.stub(console, 'error')
    const resStub = sandbox.stub()
    resStub.status = sandbox.stub()
    resStub.status.returns(resStub)
    resStub.send = sandbox.stub()
    resStub.send.returns(resStub)

    await setUserPermissions(req, resStub, nextSpy)
    expect(nextSpy.called).to.equal(false)
    expect(resStub.status.calledWith(401)).to.equal(true)
    expect(resStub.send.calledWith('Unauthorized')).to.equal(true)
  })
})
