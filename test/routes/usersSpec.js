/* global describe it */

const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../../app')

const expect = chai.expect

chai.use(chaiHttp)

describe('users routes', function () {
  describe('GET /users', function () {
    it('should return respond with a resource', async function () {
      const response = await chai.request(app).get('/users')
      expect(response.status).to.equal(200)
      expect(response.body).to.equal('respond with a resource')
    })
  })
})
