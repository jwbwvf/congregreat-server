/* global describe it beforeEach afterEach */

const fs = require('fs')
const jwt = require('jsonwebtoken')
const chai = require('chai')
const chaiHttp = require('chai-http')
const sinon = require('sinon')
const app = require('../../../app')
const config = require('../../../common/config')
const User = require('../../../models').User

const expect = chai.expect

chai.use(chaiHttp)

describe('admin users routes', function () {
  let sandbox
  const privateKey = fs.readFileSync(config.jwt.private)
  const passphrase = config.jwt.passphrase
  beforeEach(function () {
    sandbox = sinon.sandbox.create()
  })

  afterEach(function () {
    sandbox.restore()
  })
  describe('GET /users', function () {
    it('should return all users', async function () {
      var token = jwt.sign({
        id: 1
      }, { key: privateKey, passphrase }, { algorithm: 'RS512', expiresIn: 60 * 60 })

      const userOne = { id: 'testIdOne', email: 'testOne@example.com' }
      const userTwo = { id: 'testIdTwo', email: 'testTwo@example.com' }
      const users = [userOne, userTwo]

      const findAllStub = sandbox.stub(User, 'findAll').resolves(users)

      const response = await chai.request(app).get('/admin/users').set('Authorization', `Bearer ${token}`)
      expect(response.status).to.equal(200)
      expect(response.body).to.eql(users)
      expect(findAllStub.getCall(0).args[0]).to.eql({ attributes: ['id', 'first_name', 'last_name', 'email', 'congregation_id'] })
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
    it('should should fail for unauthorized if no token is not provided', async function () {
      try {
        await chai.request(app).get('/admin/users')
      } catch ({response}) {
        expect(response.status).to.equal(401)
        expect(response.body.message).to.equal('Unauthorized.')
      }
    })
  })
})
