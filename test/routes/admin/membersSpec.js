/* global describe it beforeEach afterEach */

const fs = require('fs')
const jwt = require('jsonwebtoken')
const chai = require('chai')
const chaiHttp = require('chai-http')
const sinon = require('sinon')
const faker = require('faker')
const app = require('../../../app')
const uuid = require('uuid')
const config = require('../../../common/config')
const { Member } = require('../../../models')
const { MEMBER_STATUS } = require('../../../common/status')

const expect = chai.expect

chai.use(chaiHttp)

describe('admin members routes', function () {
  let sandbox, token
  const privateKey = fs.readFileSync(config.jwt.private)
  const passphrase = config.jwt.passphrase
  beforeEach(function () {
    sandbox = sinon.sandbox.create()
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

      const response = await chai.request(app).get('/admin/members').set('Authorization', `Bearer ${token}`)
      expect(response.status).to.equal(200)
      expect(response.body).to.eql(members)
      expect(findAllStub.getCall(0).calledWith({
        attributes: ['id', 'firstName', 'lastName', 'email']
      }))
    })
    it('should return a failure if findAll throws an error', async function () {
      const findAllStub = sandbox.stub(Member, 'findAll').throws(new Error())

      try {
        await chai.request(app).get(`/admin/members/`).set('Authorization', `Bearer ${token}`)
      } catch ({response}) {
        expect(response.status).to.equal(404)
        expect(response.body).to.eql({ message: 'Unable to find all members.' })
        expect(findAllStub.getCall(0).calledWith({
          attributes: ['id', 'firstName', 'lastName', 'email']
        }))
      }
    })
    it('should should fail for unauthorized if a valid token is not provided', async function () {
      token = jwt.sign({
        id: 1
      }, 'not correct secret', { expiresIn: 60 * 60 })
      try {
        await chai.request(app).get('/admin/members').set('Authorization', `Bearer ${token}`)
      } catch ({response}) {
        expect(response.status).to.equal(401)
        expect(response.body.message).to.equal('Unauthorized.')
      }
    })
    it('should should fail for unauthorized if token is not provided', async function () {
      try {
        await chai.request(app).get('/admin/members')
      } catch ({response}) {
        expect(response.status).to.equal(401)
        expect(response.body.message).to.equal('Unauthorized.')
      }
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

      const response = await chai.request(app).get(`/admin/members/${id}`).set('Authorization', `Bearer ${token}`)
      expect(response.status).to.equal(200)
      expect(response.body).to.eql(member)
      expect(findByIdStub.getCall(0).calledWith(id))
    })
    it('should return a failure if findById throws an error', async function () {
      const id = faker.random.uuid()
      const findByIdStub = sandbox.stub(Member, 'findById').throws(new Error())
      sandbox.stub(uuid, 'v4').returns(id)

      try {
        await chai.request(app).get(`/admin/members/${id}`).set('Authorization', `Bearer ${token}`)
      } catch ({response}) {
        expect(response.status).to.equal(404)
        expect(response.body).to.eql({ message: 'Unable to find member by id.' })
        expect(findByIdStub.getCall(0).calledWith(id))
      }
    })
    it('should should fail for unauthorized if a valid token is not provided', async function () {
      token = jwt.sign({
        id: 1
      }, 'not correct secret', { expiresIn: 60 * 60 })
      try {
        await chai.request(app).get('/admin/members').set('Authorization', `Bearer ${token}`)
      } catch ({response}) {
        expect(response.status).to.equal(401)
        expect(response.body.message).to.equal('Unauthorized.')
      }
    })
    it('should should fail for unauthorized if token is not provided', async function () {
      try {
        await chai.request(app).get('/admin/members')
      } catch ({response}) {
        expect(response.status).to.equal(401)
        expect(response.body.message).to.equal('Unauthorized.')
      }
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

      const response = await chai.request(app).get(`/admin/members/congregations/${congregationId}`).set('Authorization', `Bearer ${token}`)
      expect(response.status).to.equal(200)
      expect(response.body).to.eql([memberOne, memberThree])
      expect(findAllStub.getCall(0).calledWith({
        where: { congregationId },
        attributes: ['id', 'firstName', 'lastName', 'email']
      }))
    })
    it('gets all members of a congregation', async function () {
      const congregationId = faker.random.uuid()
      sandbox.stub(Member, 'findAll').throws(new Error())

      try {
        await chai.request(app).get(`/admin/members/congregations/${congregationId}`).set('Authorization', `Bearer ${token}`)
      } catch ({response}) {
        expect(response.status).to.equal(404)
        expect(response.body.message).to.equal('Unable to find all members of the congregation.')
      }
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
        id,
        firstName,
        lastName,
        email
      }

      const createStub = sandbox.stub(Member, 'create').resolves(member)
      sandbox.stub(Member, 'findOne').resolves(null)
      sandbox.stub(uuid, 'v4').returns(id)

      const response = await chai.request(app).post('/admin/members/').set('Authorization', `Bearer ${token}`)
        .send({
          id,
          firstName,
          lastName,
          email,
          congregationId
        })

      expect(response.status).to.equal(200)
      expect(response.body).to.eql({ message: `Member ${firstName} ${lastName} was added.` })
      expect(createStub.getCall(0).calledWith({id, email, firstName, lastName, status, congregationId}))
    })
    it('should return a failure if create throws an error', async function () {
      const id = faker.random.uuid()
      const firstName = faker.name.findName()
      const lastName = faker.name.findName()
      const email = faker.internet.email()
      const congregationId = faker.random.alphaNumeric()
      const status = MEMBER_STATUS.NEW

      const createStub = sandbox.stub(Member, 'create').throws(new Error())
      sandbox.stub(Member, 'findOne').resolves(null)
      sandbox.stub(uuid, 'v4').returns(id)

      try {
        await chai.request(app).post('/admin/members/').set('Authorization', `Bearer ${token}`)
          .send({
            id,
            firstName,
            lastName,
            email,
            congregationId
          })
      } catch ({response}) {
        expect(response.status).to.equal(409)
        expect(response.body).to.eql({ message: 'Unable to create member.' })
        expect(createStub.getCall(0).calledWith({id, email, firstName, lastName, status, congregationId}))
      }
    })
    it('should return a failure if there is no congregation provided', async function () {
      const id = faker.random.uuid()
      const firstName = faker.name.findName()
      const lastName = faker.name.findName()
      const email = faker.internet.email()

      sandbox.stub(Member, 'findOne').resolves(null)
      sandbox.stub(uuid, 'v4').returns(id)

      try {
        await chai.request(app).post('/admin/members/').set('Authorization', `Bearer ${token}`)
          .send({
            id,
            firstName,
            lastName,
            email
          })
      } catch ({response}) {
        expect(response.status).to.equal(409)
        expect(response.body).to.eql({ message: 'All members must be added to a congregation. Congregation id is missing.' })
      }
    })
    it('should return a failure if there are missing required fields', async function () {
      const id = faker.random.uuid()
      const firstName = faker.name.findName()
      const lastName = faker.name.findName()
      const email = faker.internet.email()
      const congregationId = faker.random.uuid()

      // missing first name
      try {
        await chai.request(app).post('/admin/members/').set('Authorization', `Bearer ${token}`)
          .send({id, lastName, email, congregationId
          })
      } catch ({response}) {
        expect(response.status).to.equal(409)
        expect(response.body).to.eql({ message: 'All fields are required.' })
      }
      // missing last name
      try {
        await chai.request(app).post('/admin/members/').set('Authorization', `Bearer ${token}`)
          .send({id, firstName, email, congregationId
          })
      } catch ({response}) {
        expect(response.status).to.equal(409)
        expect(response.body).to.eql({ message: 'All fields are required.' })
      }
      // missing email
      try {
        await chai.request(app).post('/admin/members/').set('Authorization', `Bearer ${token}`)
          .send({id, firstName, lastName, congregationId
          })
      } catch ({response}) {
        expect(response.status).to.equal(409)
        expect(response.body).to.eql({ message: 'All fields are required.' })
      }
    })
    it('should return a failure if the member already exists', async function () {
      const id = faker.random.uuid()
      const firstName = faker.name.findName()
      const lastName = faker.name.findName()
      const email = faker.internet.email()
      const congregationId = faker.random.alphaNumeric()

      sandbox.stub(Member, 'findOne').resolves({id: faker.random.uuid()})
      sandbox.stub(uuid, 'v4').returns(id)

      try {
        await chai.request(app).post('/admin/members/').set('Authorization', `Bearer ${token}`)
          .send({
            id,
            firstName,
            lastName,
            email,
            congregationId
          })
      } catch ({response}) {
        expect(response.status).to.equal(409)
        expect(response.body).to.eql({ message: 'A member already exists with this email.' })
      }
    })
    it('should should fail for unauthorized if a valid token is not provided', async function () {
      token = jwt.sign({
        id: 1
      }, 'not correct secret', { expiresIn: 60 * 60 })
      try {
        await chai.request(app).get('/admin/members').set('Authorization', `Bearer ${token}`)
      } catch ({response}) {
        expect(response.status).to.equal(401)
        expect(response.body.message).to.equal('Unauthorized.')
      }
    })
    it('should should fail for unauthorized if token is not provided', async function () {
      try {
        await chai.request(app).get('/admin/members')
      } catch ({response}) {
        expect(response.status).to.equal(401)
        expect(response.body.message).to.equal('Unauthorized.')
      }
    })
  })
  describe('PATCH /:id', function () {
    it('should update the congregation with new name', async function () {
      const id = faker.random.uuid()
      const firstName = faker.name.findName()
      const updateFirstName = faker.name.findName()
      const updateLastName = faker.name.findName()
      const updateEmail = faker.internet.email()
      const member = { id, firstName }
      member.update = sandbox.stub().returns(true)

      const findByIdStub = sandbox.stub(Member, 'findById').resolves(member)

      const response = await chai.request(app).patch(`/admin/members/${id}`).set('Authorization', `Bearer ${token}`)
        .send({ firstName: updateFirstName, lastName: updateLastName, email: updateEmail })

      expect(response.status).to.equal(200)
      expect(response.body).to.eql({ message: 'Member was updated.' })
      expect(findByIdStub.getCall(0).calledWith(id))
      expect(member.update.calledWith({ firstName: updateFirstName, lastName: updateLastName, email: updateEmail }))
    })
    it('should return a failure if findById throws an error', async function () {
      const id = faker.random.uuid()
      const updateName = faker.name.findName()
      const findByIdStub = sandbox.stub(Member, 'findById').throws(new Error())

      try {
        await chai.request(app).patch(`/admin/members/${id}`).set('Authorization', `Bearer ${token}`)
          .send({ firstName: updateName })
      } catch ({response}) {
        expect(response.status).to.equal(404)
        expect(response.body).to.eql({ message: 'Unable to find member by id.' })
        expect(findByIdStub.calledWith(id))
      }
    })
    it('should should fail for unauthorized if a valid token is not provided', async function () {
      token = jwt.sign({
        id: 1
      }, 'not correct secret', { expiresIn: 60 * 60 })
      try {
        await chai.request(app).patch('/admin/members/1').set('Authorization', `Bearer ${token}`)
      } catch ({response}) {
        expect(response.status).to.equal(401)
        expect(response.body.message).to.equal('Unauthorized.')
      }
    })
    it('should should fail for unauthorized if token is not provided', async function () {
      try {
        await chai.request(app).patch('/admin/members/1')
      } catch ({response}) {
        expect(response.status).to.equal(401)
        expect(response.body.message).to.equal('Unauthorized.')
      }
    })
    it('should return a failure if no modifiable member property is provided', async function () {
      const id = faker.random.uuid()
      const updateId = faker.random.uuid()

      try {
        await chai.request(app).patch(`/admin/members/${id}`).set('Authorization', `Bearer ${token}`)
          .send({ id: updateId })
      } catch ({response}) {
        expect(response.status).to.equal(500)
        expect(response.body).to.eql({ message: 'No modifiable member property was provided.' })
      }
    })
    it('should return a failure if update fails', async function () {
      const id = faker.random.uuid()
      const updateName = faker.name.findName()
      const member = { id }
      member.update = sandbox.stub().returns(false)

      sandbox.stub(Member, 'findById').resolves(member)

      try {
        await chai.request(app).patch(`/admin/members/${id}`).set('Authorization', `Bearer ${token}`)
          .send({ firstName: updateName })
      } catch ({response}) {
        expect(response.status).to.equal(500)
        expect(response.body).to.eql({ message: 'Failed to update the member.' })
      }
    })
  })
  describe('DELETE /:id', function () {
    it('should set the status as deleted', async function () {
      const id = faker.random.uuid()
      const member = { id }
      member.update = sandbox.stub().returns(true)

      sandbox.stub(Member, 'findById').resolves(member)

      const response = await chai.request(app).delete(`/admin/members/${id}`).set('Authorization', `Bearer ${token}`)

      expect(member.update.calledWith(MEMBER_STATUS.DELETED))
      expect(response.status).to.equal(200)
      expect(response.body).to.eql({ message: 'Member was deleted.' })
    })
    it('should return a failure if findById throws an error', async function () {
      const id = faker.random.uuid()
      const findByIdStub = sandbox.stub(Member, 'findById').throws(new Error())

      try {
        await chai.request(app).delete(`/admin/members/${id}`).set('Authorization', `Bearer ${token}`)
      } catch ({response}) {
        expect(response.status).to.equal(404)
        expect(response.body).to.eql({ message: 'Unable to find member by id.' })
        expect(findByIdStub.getCall(0).calledWith(id))
      }
    })
    it('should return a failure if delete fails', async function () {
      const id = faker.random.uuid()
      const member = { id }
      member.update = sandbox.stub().returns(false)

      sandbox.stub(Member, 'findById').resolves(member)

      try {
        await chai.request(app).delete(`/admin/members/${id}`).set('Authorization', `Bearer ${token}`)
      } catch ({response}) {
        expect(response.status).to.equal(500)
        expect(response.body).to.eql({ message: 'Failed to delete the member.' })
      }
    })
  })
})
