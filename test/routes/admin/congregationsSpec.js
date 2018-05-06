/* global describe it beforeEach afterEach */

const jwt = require('jsonwebtoken')
const chai = require('chai')
const chaiHttp = require('chai-http')
const sinon = require('sinon')
const uuidv = require('uuid')
const app = require('../../../app')
const config = require('../../../common/config')
const Congregation = require('../../../models').Congregation

const expect = chai.expect

chai.use(chaiHttp)

describe('admin congregations routes', function () {
  let sandbox, token
  beforeEach(function () {
    sandbox = sinon.sandbox.create()
    token = jwt.sign({
      id: 1
    }, config.jwt.secret, { expiresIn: 60 * 60 })
  })

  afterEach(function () {
    sandbox.restore()
  })
  describe('GET /congregations', function () {
    it('should return all congregations', async function () {
      const congregationOne = { id: 'testIdOne', name: 'testCongregationNameOne' }
      const congregationTwo = { id: 'testIdTwo', name: 'testCongregationNameTwo' }
      const congregations = [congregationOne, congregationTwo]

      const findAllStub = sandbox.stub(Congregation, 'findAll').resolves(congregations)

      const response = await chai.request(app).get('/admin/congregations').set('Authorization', `Bearer ${token}`)
      expect(response.status).to.equal(200)
      expect(response.body).to.eql(congregations)
      expect(findAllStub.getCall(0).args[0]).to.eql({ attributes: ['id', 'name'] })
    })
    it('should return a failure if findAll throws an error', async function () {
      const findAllStub = sandbox.stub(Congregation, 'findAll').throws(new Error())

      try {
        await chai.request(app).get(`/admin/congregations/`).set('Authorization', `Bearer ${token}`)
      } catch ({response}) {
        expect(response.status).to.equal(404)
        expect(response.body).to.eql({ message: 'Unable to find all congregations.' })
        expect(findAllStub.getCall(0).args[0]).to.eql({ attributes: ['id', 'name'] })
      }
    })
    it('should should fail for unauthorized if a valid token is not provided', async function () {
      token = jwt.sign({
        id: 1
      }, 'not correct secret', { expiresIn: 60 * 60 })
      try {
        await chai.request(app).get('/admin/congregations').set('Authorization', `Bearer ${token}`)
      } catch ({response}) {
        expect(response.status).to.equal(401)
        expect(response.body.message).to.equal('Unauthorized.')
      }
    })
    it('should should fail for unauthorized if no token is not provided', async function () {
      try {
        await chai.request(app).get('/admin/congregations')
      } catch ({response}) {
        expect(response.status).to.equal(401)
        expect(response.body.message).to.equal('Unauthorized.')
      }
    })
  })
  describe('GET /:id', function () {
    it('should return all congregations', async function () {
      const id = 'testId'
      const congregation = { id: id, name: 'testCongregationName' }

      const findByIdStub = sandbox.stub(Congregation, 'findById').resolves(congregation)

      const response = await chai.request(app).get(`/admin/congregations/${id}`).set('Authorization', `Bearer ${token}`)
      expect(response.status).to.equal(200)
      expect(response.body).to.eql(congregation)
      expect(findByIdStub.getCall(0).args[0]).to.eql(id)
    })
    it('should return a failure if findById throws an error', async function () {
      const id = 'testId'

      const findByIdStub = sandbox.stub(Congregation, 'findById').throws(new Error())
      sandbox.stub(uuidv, 'v4').returns(id)

      try {
        await chai.request(app).get(`/admin/congregations/${id}`).set('Authorization', `Bearer ${token}`)
      } catch ({response}) {
        expect(response.status).to.equal(404)
        expect(response.body).to.eql({ message: 'Unable to find congregation by id.' })
        expect(findByIdStub.getCall(0).args[0]).to.eql(id)
      }
    })
    it('should should fail for unauthorized if a valid token is not provided', async function () {
      token = jwt.sign({
        id: 1
      }, 'not correct secret', { expiresIn: 60 * 60 })
      try {
        await chai.request(app).get('/admin/congregations').set('Authorization', `Bearer ${token}`)
      } catch ({response}) {
        expect(response.status).to.equal(401)
        expect(response.body.message).to.equal('Unauthorized.')
      }
    })
    it('should should fail for unauthorized if no token is not provided', async function () {
      try {
        await chai.request(app).get('/admin/congregations')
      } catch ({response}) {
        expect(response.status).to.equal(401)
        expect(response.body.message).to.equal('Unauthorized.')
      }
    })
  })
  describe('POST /', function () {
    it('should return the new congregations', async function () {
      const id = 'testId'
      const name = 'testCongregationName'
      const congregation = { id: 'testIdOne', name: 'testCongregationName' }

      const createStub = sandbox.stub(Congregation, 'create').resolves(congregation)
      sandbox.stub(uuidv, 'v4').returns(id)

      const response = await chai.request(app).post('/admin/congregations/').set('Authorization', `Bearer ${token}`)
        .send({id, name})

      expect(response.status).to.equal(200)
      expect(response.body).to.eql(congregation)
      expect(createStub.getCall(0).args[0]).to.eql({id, name})
    })
    it('should return a failure if create throws an error', async function () {
      const id = 'testId'
      const name = 'testCongregationName'

      const createStub = sandbox.stub(Congregation, 'create').throws(new Error())
      sandbox.stub(uuidv, 'v4').returns(id)

      try {
        await chai.request(app).post('/admin/congregations/').set('Authorization', `Bearer ${token}`).send({id, name})
      } catch ({response}) {
        expect(response.status).to.equal(409)
        expect(response.body).to.eql({ message: 'Unable to create congregation.' })
        expect(createStub.getCall(0).args[0]).to.eql({id, name})
      }
    })
    it('should should fail for unauthorized if a valid token is not provided', async function () {
      token = jwt.sign({
        id: 1
      }, 'not correct secret', { expiresIn: 60 * 60 })
      try {
        await chai.request(app).get('/admin/congregations').set('Authorization', `Bearer ${token}`)
      } catch ({response}) {
        expect(response.status).to.equal(401)
        expect(response.body.message).to.equal('Unauthorized.')
      }
    })
    it('should should fail for unauthorized if no token is not provided', async function () {
      try {
        await chai.request(app).get('/admin/congregations')
      } catch ({response}) {
        expect(response.status).to.equal(401)
        expect(response.body.message).to.equal('Unauthorized.')
      }
    })
  })
})
