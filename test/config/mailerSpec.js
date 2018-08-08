/* global describe it beforeEach afterEach */

const nodemailer = require('nodemailer')
const config = require('../../common/config')
const sinon = require('sinon')
const mailer = require('../../common/mailer')
const chai = require('chai')
const expect = chai.expect

describe('mailer', function () {
  let sandbox, transportStub, consoleStub
  config.smtp.host = 'testHost'
  config.smtp.port = 'testPort'
  config.smtp.secure = 'false'
  config.smtp.auth.user = 'testAuthUser'
  config.smtp.auth.pass = 'testAuthPass'
  const firstName = 'testFirstName'
  const lastName = 'testLastName'
  const email = 'testEmail@example.com'
  const token = 'testToken'
  beforeEach(function () {
    sandbox = sinon.sandbox.create()
    transportStub = sandbox.stub()
    sandbox.stub(nodemailer, 'createTransport').returns(transportStub)
    consoleStub = sandbox.stub(console, 'log')
  })

  afterEach(function () {
    sandbox.restore()
  })

  describe('sendMail', function () {
    it('sends the correct message', async function () {
      transportStub.sendMail = sandbox.stub()
      await mailer.sendMail({firstName, lastName}, email, token)
      const message = transportStub.sendMail.getCall(0).args[0]
      expect(message.to).to.equal(`${firstName} ${lastName} <${email}>`)
      expect(message.html).to.contain(token)
      expect(message.html).to.contain(firstName)
      expect(message.html).to.contain(lastName)
      expect(message.subject).to.equal('Email Confirmation')
      expect(message.from).to.equal('Congregreat <confirmation@congregreat.com>')
    })

    it('logs any error messages', async function () {
      const message = 'test error message'
      transportStub.sendMail = sandbox.stub()
      transportStub.sendMail.rejects(new Error(message))
      await mailer.sendMail({firstName, lastName}, email, token)
      expect(consoleStub.getCall(0).calledWith(message))
    })
  })
})
