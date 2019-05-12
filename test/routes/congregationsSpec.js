/* global describe it beforeEach afterEach */

const fs = require('fs')
const jwt = require('jsonwebtoken')
const chai = require('chai')
const chaiHttp = require('chai-http')
const sinon = require('sinon')
const faker = require('faker')
const uuid = require('uuid')
const config = require('../../common/config')
const Congregation = require('../../models').Congregation
const { CONGREGATION_STATUS } = require('../../common/status')

const expect = chai.expect

chai.use(chaiHttp)

describe('congregations routes', function () {
  let sandbox, token, app, congregation
  const privateKey = fs.readFileSync(config.jwt.private)
  const passphrase = config.jwt.passphrase
  beforeEach(function () {
    sandbox = sinon.sandbox.create()

    delete require.cache[require.resolve('../../routes/congregations')]
    congregation = require('../../accessControllers/congregation')
    sandbox.stub(congregation, 'canAccess').callsFake(function (action) {
      return (req, res, next) => {
        return next()
      }
    })

    // in order to mock the middleware it has to be stubbed before app is included
    // so it needs to be removed if it was already added by another test
    delete require.cache[require.resolve('../../routes')]
    delete require.cache[require.resolve('../../app')]
    app = require('../../app')

    token = jwt.sign({
      id: 1
    }, { key: privateKey, passphrase }, { algorithm: 'RS512', expiresIn: '1d' })
  })

  afterEach(function () {
    sandbox.restore()
  })
  describe('GET /congregations', function () {
    it('should return all congregations', async function () {
      const congregationOne = { id: faker.random.uuid(), name: faker.name.findName() }
      const congregationTwo = { id: faker.random.uuid(), name: faker.name.findName() }
      const congregations = [congregationOne, congregationTwo]

      const findAllStub = sandbox.stub(Congregation, 'findAll').resolves(congregations)

      const response = await chai.request(app).get('/congregations').set('Authorization', `Bearer ${token}`)
      expect(response.status).to.equal(200)
      expect(response.body).to.eql(congregations)
      expect(findAllStub.calledWith({ attributes: ['id', 'name', 'status'] })).to.equal(true)
    })
    it('should return a failure if findAll throws an error', async function () {
      const findAllStub = sandbox.stub(Congregation, 'findAll').throws(new Error())

      const response = await chai.request(app).get(`/congregations`).set('Authorization', `Bearer ${token}`)
      expect(response.status).to.equal(404)
      expect(response.body).to.eql({ message: 'Unable to find all congregations.' })
      expect(findAllStub.calledWith({ attributes: ['id', 'name', 'status'] })).to.equal(true)
    })
    it('should should fail for unauthorized if a valid token is not provided', async function () {
      token = jwt.sign({
        id: 1
      }, 'not correct secret', { expiresIn: 60 * 60 })

      const response = await chai.request(app).get('/congregations').set('Authorization', `Bearer ${token}`)
      expect(response.status).to.equal(401)
      expect(response.body.message).to.equal('Unauthorized.')
    })
    it('should should fail for unauthorized if token is not provided', async function () {
      const response = await chai.request(app).get('/congregations')
      expect(response.status).to.equal(401)
      expect(response.body.message).to.equal('Unauthorized.')
    })
  })
  describe('GET /:id', function () {
    it('should return congregation by id', async function () {
      const id = faker.random.uuid()
      const congregation = { id, name: faker.name.findName() }

      const findByIdStub = sandbox.stub(Congregation, 'findById').resolves(congregation)

      const response = await chai.request(app).get(`/congregations/${id}`).set('Authorization', `Bearer ${token}`)
      expect(response.status).to.equal(200)
      expect(response.body).to.eql(congregation)
      expect(findByIdStub.getCall(0).calledWith(id)).to.equal(true)
    })
    it('should return a failure if findById throws an error', async function () {
      const id = faker.random.uuid()

      const findByIdStub = sandbox.stub(Congregation, 'findById').throws(new Error())
      sandbox.stub(uuid, 'v4').returns(id)

      const response = await chai.request(app).get(`/congregations/${id}`).set('Authorization', `Bearer ${token}`)
      expect(response.status).to.equal(404)
      expect(response.body).to.eql({ message: 'Unable to find congregation by id.' })
      expect(findByIdStub.getCall(0).calledWith(id)).to.equal(true)
    })
    it('should should fail for unauthorized if a valid token is not provided', async function () {
      token = jwt.sign({
        id: 1
      }, 'not correct secret', { expiresIn: 60 * 60 })

      const response = await chai.request(app).get('/congregations').set('Authorization', `Bearer ${token}`)
      expect(response.status).to.equal(401)
      expect(response.body.message).to.equal('Unauthorized.')
    })
    it('should should fail for unauthorized if token is not provided', async function () {
      const response = await chai.request(app).get('/congregations')
      expect(response.status).to.equal(401)
      expect(response.body.message).to.equal('Unauthorized.')
    })
  })
  describe('POST /', function () {
    it('should return the new congregations', async function () {
      const id = faker.random.uuid()
      const name = faker.name.findName()
      const status = CONGREGATION_STATUS.NEW
      const congregation = { id, name, status }

      const createStub = sandbox.stub(Congregation, 'create').resolves(congregation)
      sandbox.stub(uuid, 'v4').returns(id)

      const response = await chai.request(app).post('/congregations').set('Authorization', `Bearer ${token}`)
        .send({ id, name })

      expect(response.status).to.equal(200)
      expect(response.body).to.eql(congregation)
      expect(createStub.getCall(0).calledWith({ id, name, status })).to.equal(true)
    })
    it('should return a failure if create throws an error', async function () {
      const id = faker.random.uuid()
      const name = faker.name.findName()
      const status = CONGREGATION_STATUS.NEW

      const createStub = sandbox.stub(Congregation, 'create').throws(new Error())
      sandbox.stub(uuid, 'v4').returns(id)

      const response = await chai.request(app).post('/congregations').set('Authorization', `Bearer ${token}`).send({ id, name })
      expect(response.status).to.equal(409)
      expect(response.body).to.eql({ message: 'Unable to create congregation.' })
      expect(createStub.getCall(0).calledWith({ id, name, status })).to.equal(true)
    })
    it('should should fail for unauthorized if a valid token is not provided', async function () {
      token = jwt.sign({
        id: 1
      }, 'not correct secret', { expiresIn: 60 * 60 })

      const response = await chai.request(app).get('/congregations').set('Authorization', `Bearer ${token}`)
      expect(response.status).to.equal(401)
      expect(response.body.message).to.equal('Unauthorized.')
    })
    it('should should fail for unauthorized if token is not provided', async function () {
      const response = await chai.request(app).get('/congregations')
      expect(response.status).to.equal(401)
      expect(response.body.message).to.equal('Unauthorized.')
    })
  })
  describe('PATCH /:id', function () {
    it('should update the congregation with new name', async function () {
      const id = faker.random.uuid()
      const updateName = faker.name.findName()

      const updateStub = sandbox.stub(Congregation, 'update').resolves()

      const response = await chai.request(app).patch(`/congregations/${id}`).set('Authorization', `Bearer ${token}`)
        .send({ name: updateName })

      const fields = { name: updateName }
      const options = { where: { id } }

      expect(response.status).to.equal(200)
      expect(response.body).to.eql({ message: 'Congregation was updated.' })
      expect(updateStub.calledWith(fields, options)).to.equal(true)
    })
    it('should return a failure if update throws an error', async function () {
      const id = faker.random.uuid()
      const updateName = faker.name.findName()
      const updateStub = sandbox.stub(Congregation, 'update').throws(new Error())

      const response = await chai.request(app).patch(`/congregations/${id}`).set('Authorization', `Bearer ${token}`).send({ name: updateName })
      const fields = { name: updateName }
      const options = { where: { id } }

      expect(response.status).to.equal(500)
      expect(response.body).to.eql({ message: 'Unable to update congregation.' })
      expect(updateStub.calledWith(fields, options)).to.equal(true)
    })
    it('should should fail for unauthorized if a valid token is not provided', async function () {
      token = jwt.sign({
        id: 1
      }, 'not correct secret', { expiresIn: 60 * 60 })

      const response = await chai.request(app).patch('/congregations/1').set('Authorization', `Bearer ${token}`)
      expect(response.status).to.equal(401)
      expect(response.body.message).to.equal('Unauthorized.')
    })
    it('should should fail for unauthorized if token is not provided', async function () {
      const response = await chai.request(app).patch('/congregations/1')
      expect(response.status).to.equal(401)
      expect(response.body.message).to.equal('Unauthorized.')
    })
    it('should return a failure if no modifiable congregation property is provided', async function () {
      const id = faker.random.uuid()
      const updateId = faker.random.uuid()

      const response = await chai.request(app).patch(`/congregations/${id}`).set('Authorization', `Bearer ${token}`)
        .send({ id: updateId })
      expect(response.status).to.equal(500)
      expect(response.body).to.eql({ message: 'No modifiable congregation property was provided.' })
    })
  })
  describe('DELETE /:id', function () {
    it('should set the status as deleted', async function () {
      const id = faker.random.uuid()

      const updateStub = sandbox.stub(Congregation, 'update').resolves()

      const response = await chai.request(app).delete(`/congregations/${id}`).set('Authorization', `Bearer ${token}`)

      const fields = { status: CONGREGATION_STATUS.DELETED }
      const options = { where: { id } }

      expect(updateStub.calledWith(fields, options)).to.equal(true)
      expect(response.status).to.equal(200)
      expect(response.body).to.eql({ message: 'Congregation was deleted.' })
    })
    it('should return a failure if update throws an error', async function () {
      const id = faker.random.uuid()
      const updateStub = sandbox.stub(Congregation, 'update').throws(new Error())

      const response = await chai.request(app).delete(`/congregations/${id}`).set('Authorization', `Bearer ${token}`)
      const fields = { status: CONGREGATION_STATUS.DELETED }
      const options = { where: { id } }

      expect(response.status).to.equal(500)
      expect(response.body).to.eql({ message: 'Unable to delete congregation.' })
      expect(updateStub.calledWith(fields, options)).to.equal(true)
    })
  })
})
