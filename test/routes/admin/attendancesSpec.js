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
const { Attendance } = require('../../../models')

const expect = chai.expect

chai.use(chaiHttp)

describe('admin attendances routes', function () {
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
  describe('POST /', function () {
    it('should return the new attendance record', async function () {
      const id = faker.random.uuid()
      const memberId = faker.random.uuid()
      const congregationId = faker.random.uuid()
      const attendance = {
        id,
        memberId,
        congregationId
      }

      const createStub = sandbox.stub(Attendance, 'create').resolves(attendance)
      sandbox.stub(uuid, 'v4').returns(id)

      const response = await chai.request(app).post('/admin/attendances/').set('Authorization', `Bearer ${token}`)
        .send({
          member_id: memberId,
          congregation_id: congregationId
        })

      expect(response.status).to.equal(200)
      expect(response.body).to.eql(attendance)
      expect(createStub.getCall(0).calledWith({id, memberId, congregationId}))
    })
    it('should return a failure if create throws an error', async function () {
      const id = faker.random.uuid()
      const memberId = faker.random.uuid()
      const congregationId = faker.random.uuid()

      const createStub = sandbox.stub(Attendance, 'create').throws(new Error())
      sandbox.stub(uuid, 'v4').returns(id)

      try {
        await chai.request(app).post('/admin/attendances/').set('Authorization', `Bearer ${token}`)
          .send({
            member_id: memberId,
            congregation_id: congregationId
          })
      } catch ({response}) {
        expect(response.status).to.equal(409)
        expect(response.body).to.eql({ message: 'Unable to add attendance record.' })
        expect(createStub.getCall(0).calledWith({id, memberId, congregationId}))
      }
    })
    it('should should fail for unauthorized if a valid token is not provided', async function () {
      token = jwt.sign({
        id: 1
      }, 'not correct secret', { expiresIn: 60 * 60 })
      try {
        await chai.request(app).get('/admin/attendances').set('Authorization', `Bearer ${token}`)
      } catch ({response}) {
        expect(response.status).to.equal(401)
        expect(response.body.message).to.equal('Unauthorized.')
      }
    })
    it('should should fail for unauthorized if token not is provided', async function () {
      try {
        await chai.request(app).get('/admin/attendances')
      } catch ({response}) {
        expect(response.status).to.equal(401)
        expect(response.body.message).to.equal('Unauthorized.')
      }
    })
  })
  describe('DELETE /:id', function () {
    it('should delete the attendance record', async function () {
      const id = faker.random.uuid()

      sandbox.stub(Attendance, 'destroy').resolves()

      const response = await chai.request(app).delete(`/admin/attendances/${id}`).set('Authorization', `Bearer ${token}`)

      expect(response.status).to.equal(200)
      expect(response.body).to.eql({ message: 'Attendance record was deleted.' })
    })
    it('should return a failure if destroy throws an error', async function () {
      const id = faker.random.uuid()
      const destroyStub = sandbox.stub(Attendance, 'destroy').throws(new Error())

      try {
        await chai.request(app).delete(`/admin/attendances/${id}`).set('Authorization', `Bearer ${token}`)
      } catch ({response}) {
        expect(response.status).to.equal(500)
        expect(response.body).to.eql({ message: 'Failed to delete the attendance record.' })
        expect(destroyStub.getCall(0).calledWith(id))
      }
    })
  })
})
