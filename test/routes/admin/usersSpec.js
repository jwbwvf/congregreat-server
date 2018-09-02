/* global describe it beforeEach afterEach */

const fs = require('fs')
const jwt = require('jsonwebtoken')
const chai = require('chai')
const chaiHttp = require('chai-http')
const sinon = require('sinon')
const faker = require('faker')
const app = require('../../../app')
const config = require('../../../common/config')
const {USER_STATUS} = require('../../../common/status')
const User = require('../../../models').User

const expect = chai.expect

chai.use(chaiHttp)

describe('admin users routes', function () {
  let sandbox, token, id, firstName, lastName, email, status, congregationId
  const privateKey = fs.readFileSync(config.jwt.private)
  const passphrase = config.jwt.passphrase
  beforeEach(function () {
    sandbox = sinon.sandbox.create()
    token = token = jwt.sign({
      id: 1
    }, { key: privateKey, passphrase }, { algorithm: 'RS512', expiresIn: '1d' })
    id = faker.random.uuid()
    firstName = faker.name.findName()
    lastName = faker.name.findName()
    email = faker.internet.email()
    status = USER_STATUS.VERIFIED
    congregationId = faker.random.uuid()
  })

  afterEach(function () {
    sandbox.restore()
  })
  describe('GET /users', function () {
    it('should return all users', async function () {
      var token = jwt.sign({ id },
        { key: privateKey, passphrase }, { algorithm: 'RS512', expiresIn: 60 * 60 })

      const userOne = { id, email, firstName, lastName, status, congregationId }
      const id2 = faker.random.uuid()
      const email2 = faker.internet.email()
      const firstName2 = faker.name.findName()
      const lastName2 = faker.name.findName()
      const congregationId2 = faker.random.uuid()
      const status2 = USER_STATUS.UNVERIFIED
      const userTwo = { id2, email2, firstName2, lastName2, status2, congregationId2 }
      const users = [userOne, userTwo]

      const findAllStub = sandbox.stub(User, 'findAll').resolves(users)

      const response = await chai.request(app).get('/admin/users').set('Authorization', `Bearer ${token}`)
      expect(response.status).to.equal(200)
      expect(response.body).to.eql(users)
      expect(findAllStub.getCall(0).calledWith({ attributes: ['id', 'first_name', 'last_name', 'email', 'congregation_id', 'status'] }))
    })
    it('should return a failure if findAll throws an error', async function () {
      const findAllStub = sandbox.stub(User, 'findAll').throws(new Error())

      try {
        await chai.request(app).get(`/admin/users/`).set('Authorization', `Bearer ${token}`)
      } catch ({response}) {
        expect(response.status).to.equal(404)
        expect(response.body).to.eql({ message: 'Unable to find all users.' })
        expect(findAllStub.getCall(0).calledWith({ attributes: ['id', 'first_name', 'last_name', 'email', 'congregation_id', 'status'] }))
      }
    })
    it('should should fail for unauthorized if a valid token is not provided', async function () {
      var token = jwt.sign({
        id: 1
      }, 'not correct secret', { expiresIn: 60 * 60 })
      try {
        await chai.request(app).get('/admin/users').set('Authorization', `Bearer ${token}`)
      } catch ({response}) {
        expect(response.status).to.equal(401)
        expect(response.body.message).to.equal('Unauthorized.')
      }
    })
    it('should should fail for unauthorized if token is not provided', async function () {
      try {
        await chai.request(app).get('/admin/users')
      } catch ({response}) {
        expect(response.status).to.equal(401)
        expect(response.body.message).to.equal('Unauthorized.')
      }
    })
  })

  describe('GET /:id', function () {
    it('should return user by id', async function () {
      const user = { id, firstName, lastName }

      const findByIdStub = sandbox.stub(User, 'findById').resolves(user)

      const response = await chai.request(app).get(`/admin/users/${id}`).set('Authorization', `Bearer ${token}`)
      expect(response.status).to.equal(200)
      expect(response.body).to.eql(user)
      expect(findByIdStub.getCall(0).calledWith(id))
    })
    it('should return a failure if findById throws an error', async function () {
      const id = faker.random.uuid()

      const findByIdStub = sandbox.stub(User, 'findById').throws(new Error())

      try {
        await chai.request(app).get(`/admin/users/${id}`).set('Authorization', `Bearer ${token}`)
      } catch ({response}) {
        expect(response.status).to.equal(404)
        expect(response.body).to.eql({ message: 'Unable to find user by id.' })
        expect(findByIdStub.getCall(0).calledWith(id))
      }
    })
    it('should should fail for unauthorized if a valid token is not provided', async function () {
      token = jwt.sign({
        id: 1
      }, 'not correct secret', { expiresIn: 60 * 60 })
      try {
        await chai.request(app).get('/admin/users').set('Authorization', `Bearer ${token}`)
      } catch ({response}) {
        expect(response.status).to.equal(401)
        expect(response.body.message).to.equal('Unauthorized.')
      }
    })
    it('should should fail for unauthorized if token is not provided', async function () {
      try {
        await chai.request(app).get('/admin/users')
      } catch ({response}) {
        expect(response.status).to.equal(401)
        expect(response.body.message).to.equal('Unauthorized.')
      }
    })
  })

  describe('PATCH /:id', function () {
    it('should update the user with new properties', async function () {
      const id = faker.random.uuid()
      const updateFirstName = faker.name.findName()
      const updateLastName = faker.name.findName()
      const updateEmail = faker.internet.email()

      const user = { id, firstName, lastName, email }
      user.update = sandbox.stub().returns(true)

      const findByIdStub = sandbox.stub(User, 'findById').resolves(user)

      const response = await chai.request(app).patch(`/admin/users/${id}`).set('Authorization', `Bearer ${token}`)
        .send({ firstName: updateFirstName, lastName: updateLastName, email: updateEmail })

      expect(response.status).to.equal(200)
      expect(response.body).to.eql({ message: 'User was updated.' })
      expect(findByIdStub.getCall(0).calledWith(id))
      expect(user.update.calledWith({ firstName: updateFirstName, lastName: updateLastName, email: updateEmail }))
    })
    it('should return a failure if findById throws an error', async function () {
      const id = faker.random.uuid()
      const updateEmail = faker.internet.email()
      const findByIdStub = sandbox.stub(User, 'findById').throws(new Error())

      try {
        await chai.request(app).patch(`/admin/users/${id}`).set('Authorization', `Bearer ${token}`).send({ email: updateEmail })
      } catch ({response}) {
        expect(response.status).to.equal(404)
        expect(response.body).to.eql({ message: 'Unable to find user by id.' })
        expect(findByIdStub.calledWith(id))
      }
    })
    it('should should fail for unauthorized if a valid token is not provided', async function () {
      token = jwt.sign({
        id: 1
      }, 'not correct secret', { expiresIn: 60 * 60 })
      try {
        await chai.request(app).patch('/admin/users/1').set('Authorization', `Bearer ${token}`)
      } catch ({response}) {
        expect(response.status).to.equal(401)
        expect(response.body.message).to.equal('Unauthorized.')
      }
    })
    it('should should fail for unauthorized if token is not provided', async function () {
      try {
        await chai.request(app).patch('/admin/users/1')
      } catch ({response}) {
        expect(response.status).to.equal(401)
        expect(response.body.message).to.equal('Unauthorized.')
      }
    })
    it('should return a failure if no modifiable user property is provided', async function () {
      const id = faker.random.uuid()
      const updateId = faker.random.uuid()

      try {
        await chai.request(app).patch(`/admin/users/${id}`).set('Authorization', `Bearer ${token}`)
          .send({ id: updateId })
      } catch ({response}) {
        expect(response.status).to.equal(500)
        expect(response.body).to.eql({ message: 'No modifiable user property was provided.' })
      }
    })
    it('should return a failure if update fails', async function () {
      const id = faker.random.uuid()
      const updateEmail = faker.internet.email()
      const user = { id }
      user.update = sandbox.stub().returns(false)

      sandbox.stub(User, 'findById').resolves(user)

      try {
        await chai.request(app).patch(`/admin/users/${id}`).set('Authorization', `Bearer ${token}`)
          .send({ email: updateEmail })
      } catch ({response}) {
        expect(response.status).to.equal(500)
        expect(response.body).to.eql({ message: 'Failed to update the user.' })
      }
    })
  })

  describe('DELETE /:id', function () {
    it('should set the status as deleted', async function () {
      const id = faker.random.uuid()
      const user = { id }
      user.update = sandbox.stub().returns(true)

      sandbox.stub(User, 'findById').resolves(user)

      const response = await chai.request(app).delete(`/admin/users/${id}`).set('Authorization', `Bearer ${token}`)

      expect(user.update.calledWith(USER_STATUS.DELETED))
      expect(response.status).to.equal(200)
      expect(response.body).to.eql({ message: 'User was deleted.' })
    })
    it('should return a failure if findById throws an error', async function () {
      const id = faker.random.uuid()
      const findByIdStub = sandbox.stub(User, 'findById').throws(new Error())

      try {
        await chai.request(app).delete(`/admin/users/${id}`).set('Authorization', `Bearer ${token}`)
      } catch ({response}) {
        expect(response.status).to.equal(404)
        expect(response.body).to.eql({ message: 'Unable to find user by id.' })
        expect(findByIdStub.getCall(0).calledWith(id))
      }
    })
    it('should return a failure if delete fails', async function () {
      const id = faker.random.uuid()
      const user = { id }
      user.update = sandbox.stub().returns(false)

      sandbox.stub(User, 'findById').resolves(user)

      try {
        await chai.request(app).delete(`/admin/users/${id}`).set('Authorization', `Bearer ${token}`)
      } catch ({response}) {
        expect(response.status).to.equal(500)
        expect(response.body).to.eql({ message: 'Failed to delete the user.' })
      }
    })
  })
})
