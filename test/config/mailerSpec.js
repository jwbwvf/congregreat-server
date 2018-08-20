/* global describe it beforeEach afterEach */

const nodemailer = require('nodemailer')
const config = require('../../common/config')
const sinon = require('sinon')
const faker = require('faker')
const mailer = require('../../common/mailer')
const chai = require('chai')
const expect = chai.expect

describe('mailer', function () {
  let sandbox, transportStub, consoleStub
  config.smtp.host = faker.internet.ip()
  config.smtp.port = faker.random.number()
  config.smtp.secure = 'false'
  config.smtp.auth.user = faker.name.findName()
  config.smtp.auth.pass = faker.internet.password()
  const firstName = faker.name.findName()
  const lastName = faker.name.findName()
  const email = faker.internet.email()
  const token = faker.lorem.word()
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
      await mailer.sendMail(firstName, lastName, email, token)
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
