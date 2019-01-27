/* global describe it beforeEach afterEach */

const fs = require('fs')
const jwt = require('jsonwebtoken')
const chai = require('chai')
const chaiHttp = require('chai-http')
const sinon = require('sinon')
const faker = require('faker')
const uuid = require('uuid')
const config = require('../../common/config')
const { Attendance } = require('../../models')
const setUserPermissions = require('../../accessControllers/setUserPermissions')

const expect = chai.expect

chai.use(chaiHttp)

describe('attendances routes', function () {
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
  describe('POST /', function () {
    it('should return the new attendance record', async function () {
      const id = faker.random.uuid()
      const memberId = faker.random.uuid()
      const eventId = faker.random.uuid()
      const attendance = {
        id,
        memberId,
        eventId
      }

      const createStub = sandbox.stub(Attendance, 'create').resolves(attendance)
      sandbox.stub(uuid, 'v4').returns(id)

      const response = await chai.request(app).post('/attendances/').set('Authorization', `Bearer ${token}`)
        .send({
          memberId,
          eventId
        })

      expect(response.status).to.equal(200)
      expect(response.body).to.eql(attendance)
      expect(createStub.getCall(0).calledWith({ id, memberId, eventId }))
    })
    it('should return a failure if create throws an error', async function () {
      const id = faker.random.uuid()
      const memberId = faker.random.uuid()
      const eventId = faker.random.uuid()

      const createStub = sandbox.stub(Attendance, 'create').throws(new Error())
      sandbox.stub(uuid, 'v4').returns(id)

      try {
        await chai.request(app).post('/attendances/').set('Authorization', `Bearer ${token}`)
          .send({
            memberId,
            eventId
          })
      } catch ({ response }) {
        expect(response.status).to.equal(409)
        expect(response.body).to.eql({ message: 'Unable to add attendance record.' })
        expect(createStub.getCall(0).calledWith({ id, memberId, eventId }))
      }
    })
    it('should should fail for unauthorized if a valid token is not provided', async function () {
      token = jwt.sign({
        id: 1
      }, 'not correct secret', { expiresIn: 60 * 60 })
      try {
        await chai.request(app).get('/attendances').set('Authorization', `Bearer ${token}`)
      } catch ({ response }) {
        expect(response.status).to.equal(401)
        expect(response.body.message).to.equal('Unauthorized.')
      }
    })
    it('should should fail for unauthorized if token not is provided', async function () {
      try {
        await chai.request(app).get('/attendances')
      } catch ({ response }) {
        expect(response.status).to.equal(401)
        expect(response.body.message).to.equal('Unauthorized.')
      }
    })
    it('should should fail if memberId is not provided', async function () {
      try {
        await chai.request(app).post('/attendances/').set('Authorization', `Bearer ${token}`)
          .send({
            congregationId: faker.random.uuid()
          })
      } catch ({ response }) {
        expect(response.status).to.equal(409)
        expect(response.body.message).to.equal('All fields are required.')
      }
    })
    it('should should fail if congregationId is not provided', async function () {
      try {
        await chai.request(app).post('/attendances/').set('Authorization', `Bearer ${token}`)
          .send({
            memberId: faker.random.uuid()
          })
      } catch ({ response }) {
        expect(response.status).to.equal(409)
        expect(response.body.message).to.equal('All fields are required.')
      }
    })
  })
  describe('DELETE /:id', function () {
    it('should delete the attendance record', async function () {
      const id = faker.random.uuid()

      sandbox.stub(Attendance, 'destroy').resolves()

      const response = await chai.request(app).delete(`/attendances/${id}`).set('Authorization', `Bearer ${token}`)

      expect(response.status).to.equal(200)
      expect(response.body).to.eql({ message: 'Attendance record was deleted.' })
    })
    it('should return a failure if destroy throws an error', async function () {
      const id = faker.random.uuid()
      const destroyStub = sandbox.stub(Attendance, 'destroy').throws(new Error())

      try {
        await chai.request(app).delete(`/attendances/${id}`).set('Authorization', `Bearer ${token}`)
      } catch ({ response }) {
        expect(response.status).to.equal(500)
        expect(response.body).to.eql({ message: 'Failed to delete the attendance record.' })
        expect(destroyStub.getCall(0).calledWith(id))
      }
    })
  })
})
