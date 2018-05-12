/* global describe it */

const fs = require('fs')
const jwt = require('jsonwebtoken')
const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../../app')
const config = require('../../common/config')

const expect = chai.expect

chai.use(chaiHttp)

describe('users routes', function () {
  const privateKey = fs.readFileSync(config.jwt.private)
  const passphrase = config.jwt.passphrase
  describe('GET /users', function () {
    it('should return respond with a resource', async function () {
      var token = jwt.sign({
        id: 1
      }, { key: privateKey, passphrase }, { algorithm: 'RS512', expiresIn: 60 * 60 })
      const response = await chai.request(app).get('/users').set('Authorization', `Bearer ${token}`)
      expect(response.status).to.equal(200)
      expect(response.body).to.equal('respond with a resource')
    })
    it('should should fail for unauthorized if a valid token is not provided', async function () {
      var token = jwt.sign({
        id: 1
      }, 'not correct secret', { expiresIn: 60 * 60 })
      try {
        await chai.request(app).get('/users').set('Authorization', `Bearer ${token}`)
      } catch ({response}) {
        expect(response.status).to.equal(401)
        expect(response.body.message).to.equal('Unauthorized.')
      }
    })
    it('should should fail for unauthorized if no token is not provided', async function () {
      try {
        await chai.request(app).get('/users')
      } catch ({response}) {
        expect(response.status).to.equal(401)
        expect(response.body.message).to.equal('Unauthorized.')
      }
    })
  })
})
