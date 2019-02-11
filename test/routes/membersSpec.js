/* global describe it beforeEach afterEach */

const fs = require('fs')
const jwt = require('jsonwebtoken')
const chai = require('chai')
const chaiHttp = require('chai-http')
const sinon = require('sinon')
const faker = require('faker')
const uuid = require('uuid')
const config = require('../../common/config')
const { Member } = require('../../models')
const { MEMBER_STATUS } = require('../../common/status')
const setUserPermissions = require('../../accessControllers/setUserPermissions')

const expect = chai.expect

chai.use(chaiHttp)

describe('members routes', function () {
  let sandbox, token, app
  const privateKey = fs.readFileSync(config.jwt.private)
  const passphrase = config.jwt.passphrase
  beforeEach(function () {
    sandbox = sinon.sandbox.create()

    sandbox.stub(setUserPermissions, 'setUserPermissions').callsFake(function (req, res, next) {
      return next()
    })

    // in order to mock the middleware it has to be stubbed before app is included
    // so it needs to be removed if it was already added by another test
    delete require.cache[require.resolve('../../app')]
    app = require('../../app')

    token = jwt.sign({
      id: 1
    }, { key: privateKey, passphrase }, { algorithm: 'RS512', expiresIn: '1d' })
  })

  afterEach(function () {
    sandbox.restore()
  })
  describe('GET /members', function () {
    it('should return all members', async function () {
      const memberOne = {
        id: faker.random.uuid(),
        firstName: faker.name.findName(),
        lastName: faker.name.findName(),
        email: faker.internet.email()
      }
      const memberTwo = {
        id: faker.random.uuid(),
        firstName: faker.name.findName(),
        lastName: faker.name.findName(),
        email: faker.internet.email()
      }
      const members = [memberOne, memberTwo]

      const findAllStub = sandbox.stub(Member, 'findAll').resolves(members)

      const response = await chai.request(app).get('/members').set('Authorization', `Bearer ${token}`)
      expect(response.status).to.equal(200)
      expect(response.body).to.eql(members)
      expect(findAllStub.getCall(0).calledWith({
        attributes: ['id', 'firstName', 'lastName', 'email']
      })).to.equal(true)
    })
    it('should return a failure if findAll throws an error', async function () {
      const findAllStub = sandbox.stub(Member, 'findAll').throws(new Error())

      const response = await chai.request(app).get(`/members/`).set('Authorization', `Bearer ${token}`)
      expect(response.status).to.equal(404)
      expect(response.body).to.eql({ message: 'Unable to find all members.' })
      expect(findAllStub.getCall(0).calledWith({
        attributes: ['id', 'firstName', 'lastName', 'email']
      })).to.equal(true)
    })
    it('should should fail for unauthorized if a valid token is not provided', async function () {
      token = jwt.sign({
        id: 1
      }, 'not correct secret', { expiresIn: 60 * 60 })
      const response = await chai.request(app).get('/members').set('Authorization', `Bearer ${token}`)
      expect(response.status).to.equal(401)
      expect(response.body.message).to.equal('Unauthorized.')
    })
    it('should should fail for unauthorized if token is not provided', async function () {
      const response = await chai.request(app).get('/members')
      expect(response.status).to.equal(401)
      expect(response.body.message).to.equal('Unauthorized.')
    })
  })
  describe('GET /:id', function () {
    it('should return member by id', async function () {
      const id = faker.random.uuid()
      const member = {
        id: faker.random.uuid(),
        firstName: faker.name.findName(),
        lastName: faker.name.findName(),
        email: faker.internet.email()
      }

      const findByIdStub = sandbox.stub(Member, 'findById').resolves(member)

      const response = await chai.request(app).get(`/members/${id}`).set('Authorization', `Bearer ${token}`)
      expect(response.status).to.equal(200)
      expect(response.body).to.eql(member)
      expect(findByIdStub.getCall(0).calledWith(id)).to.equal(true)
    })
    it('should return a failure if findById throws an error', async function () {
      const id = faker.random.uuid()
      const findByIdStub = sandbox.stub(Member, 'findById').throws(new Error())

      const response = await chai.request(app).get(`/members/${id}`).set('Authorization', `Bearer ${token}`)
      expect(response.status).to.equal(404)
      expect(response.body).to.eql({ message: 'Unable to find member by id.' })
      expect(findByIdStub.getCall(0).calledWith(id)).to.equal(true)
    })
    it('should should fail for unauthorized if a valid token is not provided', async function () {
      token = jwt.sign({
        id: 1
      }, 'not correct secret', { expiresIn: 60 * 60 })

      const response = await chai.request(app).get('/members').set('Authorization', `Bearer ${token}`)
      expect(response.status).to.equal(401)
      expect(response.body.message).to.equal('Unauthorized.')
    })
    it('should should fail for unauthorized if token is not provided', async function () {
      const response = await chai.request(app).get('/members')
      expect(response.status).to.equal(401)
      expect(response.body.message).to.equal('Unauthorized.')
    })
  })
  describe('GET /congregations/:id', function () {
    it('gets all members of a congregation', async function () {
      const congregationId = faker.random.uuid()
      const memberOne = {
        id: faker.random.uuid(),
        firstName: faker.name.findName(),
        lastName: faker.name.findName(),
        email: faker.internet.email(),
        congregationId
      }
      const memberTwo = {
        id: faker.random.uuid(),
        firstName: faker.name.findName(),
        lastName: faker.name.findName(),
        email: faker.internet.email(),
        congregationId: faker.random.uuid()
      }
      const memberThree = {
        id: faker.random.uuid(),
        firstName: faker.name.findName(),
        lastName: faker.name.findName(),
        email: faker.internet.email(),
        congregationId
      }

      const members = [memberOne, memberTwo, memberThree]
      const findAllStub = sandbox.stub(Member, 'findAll').resolves(members.filter(member => member.congregationId === congregationId))

      const response = await chai.request(app).get(`/members/congregations/${congregationId}`).set('Authorization', `Bearer ${token}`)
      expect(response.status).to.equal(200)
      expect(response.body).to.eql([memberOne, memberThree])
      expect(findAllStub.calledWith({
        where: { congregationId },
        attributes: ['id', 'firstName', 'lastName', 'email']
      })).to.equal(true)
    })
    it('gets all members of a congregation', async function () {
      const congregationId = faker.random.uuid()
      sandbox.stub(Member, 'findAll').throws(new Error())

      const response = await chai.request(app).get(`/members/congregations/${congregationId}`).set('Authorization', `Bearer ${token}`)
      expect(response.status).to.equal(404)
      expect(response.body.message).to.equal('Unable to find all members of the congregation.')
    })
  })
  describe('POST /', function () {
    it('should return the new member', async function () {
      const id = faker.random.uuid()
      const firstName = faker.name.findName()
      const lastName = faker.name.findName()
      const email = faker.internet.email()
      const congregationId = faker.random.alphaNumeric()
      const status = MEMBER_STATUS.ACTIVE
      const member = {
        firstName,
        lastName
      }

      const createStub = sandbox.stub(Member, 'create').resolves(member)
      sandbox.stub(Member, 'findOne').resolves(null)
      sandbox.stub(uuid, 'v4').returns(id)

      const response = await chai.request(app).post('/members/').set('Authorization', `Bearer ${token}`)
        .send({
          id,
          firstName,
          lastName,
          email,
          congregationId
        })

      expect(response.status).to.equal(200)
      expect(response.body).to.eql({ message: `Member ${firstName} ${lastName} was added.` })
      expect(createStub.calledWith({ id, email, firstName, lastName, status, congregationId })).to.equal(true)
    })
    it('should return a failure if create throws an error', async function () {
      const id = faker.random.uuid()
      const firstName = faker.name.findName()
      const lastName = faker.name.findName()
      const email = faker.internet.email()
      const congregationId = faker.random.alphaNumeric()

      sandbox.stub(Member, 'create').throws(new Error())
      sandbox.stub(Member, 'findOne').resolves(null)
      sandbox.stub(uuid, 'v4').returns(id)

      const response = await chai.request(app).post('/members/').set('Authorization', `Bearer ${token}`)
        .send({
          id,
          firstName,
          lastName,
          email,
          congregationId
        })
      expect(response.status).to.equal(409)
      expect(response.body).to.eql({ message: 'Unable to create member.' })
    })
    it('should return a failure if there is no congregation provided', async function () {
      const id = faker.random.uuid()
      const firstName = faker.name.findName()
      const lastName = faker.name.findName()
      const email = faker.internet.email()

      sandbox.stub(Member, 'findOne').resolves(null)
      sandbox.stub(uuid, 'v4').returns(id)

      const response = await chai.request(app).post('/members/').set('Authorization', `Bearer ${token}`)
        .send({
          id,
          firstName,
          lastName,
          email
        })
      expect(response.status).to.equal(409)
      expect(response.body).to.eql({ message: 'All members must be added to a congregation. Congregation id is missing.' })
    })
    it('should return a failure if there are missing required fields', async function () {
      const id = faker.random.uuid()
      const firstName = faker.name.findName()
      const lastName = faker.name.findName()
      const email = faker.internet.email()
      const congregationId = faker.random.uuid()

      // missing first name
      const responseFirstName = await chai.request(app).post('/members/').set('Authorization', `Bearer ${token}`)
        .send({ id, lastName, email, congregationId })
      expect(responseFirstName.status).to.equal(409)
      expect(responseFirstName.body).to.eql({ message: 'All fields are required.' })
      // missing last name
      const responseLastName = await chai.request(app).post('/members/').set('Authorization', `Bearer ${token}`)
        .send({ id, firstName, email, congregationId })
      expect(responseLastName.status).to.equal(409)
      expect(responseLastName.body).to.eql({ message: 'All fields are required.' })
      // missing email
      const responseEmail = await chai.request(app).post('/members/').set('Authorization', `Bearer ${token}`)
        .send({ id, firstName, lastName, congregationId })
      expect(responseEmail.status).to.equal(409)
      expect(responseEmail.body).to.eql({ message: 'All fields are required.' })
    })
    it('should return a failure if the member already exists', async function () {
      const id = faker.random.uuid()
      const firstName = faker.name.findName()
      const lastName = faker.name.findName()
      const email = faker.internet.email()
      const congregationId = faker.random.alphaNumeric()

      sandbox.stub(Member, 'findOne').resolves({ id: faker.random.uuid() })
      sandbox.stub(uuid, 'v4').returns(id)

      const response = await chai.request(app).post('/members/').set('Authorization', `Bearer ${token}`)
        .send({
          id,
          firstName,
          lastName,
          email,
          congregationId
        })
      expect(response.status).to.equal(409)
      expect(response.body).to.eql({ message: 'A member already exists with this email.' })
    })
    it('should should fail for unauthorized if a valid token is not provided', async function () {
      token = jwt.sign({
        id: 1
      }, 'not correct secret', { expiresIn: 60 * 60 })

      const response = await chai.request(app).get('/members').set('Authorization', `Bearer ${token}`)
      expect(response.status).to.equal(401)
      expect(response.body.message).to.equal('Unauthorized.')
    })
    it('should should fail for unauthorized if token is not provided', async function () {
      const response = await chai.request(app).get('/members')
      expect(response.status).to.equal(401)
      expect(response.body.message).to.equal('Unauthorized.')
    })
  })
  describe('PATCH /:id', function () {
    it('should update the member with new name', async function () {
      const id = faker.random.uuid()
      const updateFirstName = faker.name.findName()
      const updateLastName = faker.name.findName()
      const updateEmail = faker.internet.email()

      const updateStub = sandbox.stub(Member, 'update').resolves()

      const response = await chai.request(app).patch(`/members/${id}`).set('Authorization', `Bearer ${token}`)
        .send({ firstName: updateFirstName, lastName: updateLastName, email: updateEmail })

      expect(response.status).to.equal(200)
      expect(response.body).to.eql({ message: 'Member was updated.' })
      expect(updateStub.getCall(0).calledWith({ firstName: updateFirstName, lastName: updateLastName, email: updateEmail })).to.equal(true)
    })
    it('should should fail for unauthorized if a valid token is not provided', async function () {
      token = jwt.sign({
        id: 1
      }, 'not correct secret', { expiresIn: 60 * 60 })

      const response = await chai.request(app).patch('/members/1').set('Authorization', `Bearer ${token}`)
      expect(response.status).to.equal(401)
      expect(response.body.message).to.equal('Unauthorized.')
    })
    it('should should fail for unauthorized if token is not provided', async function () {
      const response = await chai.request(app).patch('/members/1')
      expect(response.status).to.equal(401)
      expect(response.body.message).to.equal('Unauthorized.')
    })
    it('should return a failure if no modifiable member property is provided', async function () {
      const id = faker.random.uuid()
      const updateId = faker.random.uuid()

      const response = await chai.request(app).patch(`/members/${id}`).set('Authorization', `Bearer ${token}`)
        .send({ id: updateId })
      expect(response.status).to.equal(500)
      expect(response.body).to.eql({ message: 'No modifiable member property was provided.' })
    })
  })
  describe('DELETE /:id', function () {
    it('should set the status as deleted', async function () {
      const id = faker.random.uuid()

      const updateStub = sandbox.stub(Member, 'update').resolves()

      const response = await chai.request(app).delete(`/members/${id}`).set('Authorization', `Bearer ${token}`)

      const fields = { status: MEMBER_STATUS.DELETED }
      const options = { where: { id } }

      expect(updateStub.calledWith(fields, options)).to.equal(true)
      expect(response.status).to.equal(200)
      expect(response.body).to.eql({ message: 'Member was deleted.' })
    })
    it('should return a failure if update throws an error', async function () {
      const id = faker.random.uuid()
      sandbox.stub(Member, 'update').throws(new Error())

      const response = await chai.request(app).delete(`/members/${id}`).set('Authorization', `Bearer ${token}`)
      expect(response.status).to.equal(500)
      expect(response.body).to.eql({ message: 'Unable to delete the member.' })
    })
  })
})
