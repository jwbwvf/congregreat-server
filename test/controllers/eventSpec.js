/* global describe it beforeEach afterEach */

const {
  getAll,
  getById,
  create,
  update,
  softDelete
} = require('../../controllers/event')
const { Event } = require('../../models')
const { EVENT_STATUS } = require('../../common/status')
const uuid = require('uuid')
const sinon = require('sinon')
const faker = require('faker')
const chai = require('chai')

const expect = chai.expect

describe('event', function () {
  let sandbox, errorStub, logStub, req, resStub, events
  beforeEach(function () {
    sandbox = sinon.sandbox.create()
    errorStub = sandbox.stub(console, 'error')
    logStub = sandbox.stub(console, 'log')
    resStub = sandbox.stub()
    resStub.status = sandbox.stub()
    resStub.status.returns(resStub)
    resStub.json = sandbox.stub()
    resStub.json.returns(resStub)
    req = {}

    events = [{
      id: faker.random.uuid(),
      name: faker.random.word(),
      description: faker.random.words(),
      status: EVENT_STATUS.NEW,
      startDate: new Date(),
      endDate: new Date(),
      startTime: Date.now(),
      endTime: Date.now(),
      createdBy: faker.random.uuid(),
      updatedBy: faker.random.uuid(),
      congregationId: faker.random.uuid()
    }, {
      id: faker.random.uuid(),
      name: faker.random.word(),
      description: faker.random.words(),
      status: EVENT_STATUS.NEW,
      startDate: new Date(),
      endDate: new Date(),
      startTime: Date.now(),
      endTime: Date.now(),
      createdBy: faker.random.uuid(),
      updatedBy: faker.random.uuid(),
      congregationId: faker.random.uuid()
    }]
  })
  afterEach(function () {
    sandbox.restore()
  })
  describe('getAll', async function () {
    it('should get all events', async function () {
      sandbox.stub(Event, 'findAll').resolves(events)

      await getAll(req, resStub)
      expect(resStub.status.calledWith(200)).to.equal(true)
      expect(resStub.json.calledWith(events)).to.equal(true)
    })
    it('should return an error if one is caught', async function () {
      const errorMessage = faker.random.words()
      const error = new Error(errorMessage)
      sandbox.stub(Event, 'findAll').throws(error)

      await getAll(req, resStub)
      expect(errorStub.calledWith(error)).to.equal(true)
      expect(resStub.status.calledWith(404)).to.equal(true)
      expect(resStub.json.calledWith({ message: 'Unable to find all events.' })).to.equal(true)
    })
  })
  describe('getById', function () {
    it('should get the event for a given id', async function () {
      sandbox.stub(Event, 'findById').withArgs(events[0].id).resolves(events[0])

      req.params = { id: events[0].id }

      await getById(req, resStub)
      expect(resStub.status.calledWith(200)).to.equal(true)
      expect(resStub.json.calledWith(events[0])).to.equal(true)
    })
    it('should return an error if one is caught', async function () {
      const errorMessage = faker.random.words()
      const error = new Error(errorMessage)
      sandbox.stub(Event, 'findById').throws(error)

      req.params = { id: faker.random.number() }

      await getById(req, resStub)
      expect(errorStub.calledWith(error)).to.equal(true)
      expect(resStub.status.calledWith(404)).to.equal(true)
      expect(resStub.json.calledWith({ message: 'Unable to find event by id.' })).to.equal(true)
    })
  })
  describe('create', function () {
    it('should create a new event', async function () {
      const event = {}
      const createStub = sandbox.stub(Event, 'create').resolves(event)
      req.body = {
        name: faker.random.words(),
        startDate: new Date(),
        endDate: new Date(),
        startTime: Date.now(),
        endTime: Date.now()
      }
      req.user = {
        id: faker.random.uuid(),
        congregationId: faker.random.uuid()
      }
      const id = uuid.v4()
      sandbox.stub(uuid, 'v4').returns(id)

      await create(req, resStub)
      expect(resStub.status.calledWith(200)).to.equal(true)
      expect(resStub.json.calledWith(event)).to.equal(true)
      expect(createStub.calledWith({
        id,
        name: req.body.name,
        description: undefined,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        startTime: req.body.startDate,
        endTime: req.body.endTime,
        createdBy: req.user.id,
        updatedBy: req.user.id
      }))
    })
    it('should return an error if the required fields are not on the body', async function () {
      req.body = {}
      req.user = { id: faker.random.number() }

      await create(req, resStub)
      expect(resStub.status.calledWith(409)).to.equal(true)
      expect(resStub.json.calledWith({ message: 'Not all required fields were provided.' })).to.equal(true)
      expect(logStub.calledWith(`User ${req.user.id} tried to create an event without the required fields. ${JSON.stringify(req.body)}`)).to.equal(true)
    })
    it('should return an error if one is caught', async function () {
      const errorMessage = faker.random.words()
      const error = new Error(errorMessage)
      sandbox.stub(Event, 'create').throws(error)

      req.body = {
        name: faker.random.words(),
        startDate: new Date(),
        endDate: new Date(),
        startTime: Date.now(),
        endTime: Date.now()
      }
      req.user = { id: faker.random.number() }

      await create(req, resStub)
      expect(errorStub.calledWith(error)).to.equal(true)
      expect(resStub.status.calledWith(409)).to.equal(true)
      expect(resStub.json.calledWith({ message: 'Unable to create event.' })).to.equal(true)
    })
  })
  describe('update', function () {
    it('should update an existing event', async function () {
      const updateStub = sandbox.stub(Event, 'update').resolves([1])
      req.user = { id: faker.random.uuid() }
      req.params = { id: events[0].id }
      req.body = {
        name: faker.random.word()
      }

      await update(req, resStub)
      expect(resStub.status.calledWith(200)).to.equal(true)
      expect(resStub.json.calledWith(({ message: 'Event was updated.' })))
      expect(updateStub.calledWith({ updatedBy: req.user.id, name: req.body.name }, { where: { id: req.params.id } })).to.equal(true)
    })
    it('should return an error if no modifiable property was provided', async function () {
      req.user = { id: faker.random.uuid() }
      req.body = {}

      await update(req, resStub)
      expect(resStub.status.calledWith(500)).to.equal(true)
      expect(resStub.json.calledWith({ message: 'No modifiable event property was provided.' })).to.equal(true)
      expect(logStub.calledWith(`User ${req.user.id} tried to update an event without a modifiable property. ${JSON.stringify(req.body)}`)).to.equal(true)
    })
    it('should return an error if one is caught', async function () {
      const errorMessage = faker.random.words()
      const error = new Error(errorMessage)
      sandbox.stub(Event, 'update').throws(error)

      req.user = { id: faker.random.number() }
      req.params = { id: faker.random.number() }
      req.body = { name: faker.random.word() }

      await update(req, resStub)
      expect(errorStub.calledWith(error)).to.equal(true)
      expect(resStub.status.calledWith(500)).to.equal(true)
      expect(resStub.json.calledWith({ message: 'Unable to update the event.' })).to.equal(true)
    })
  })
  describe('softDelete', function () {
    it('should set the status of the event as deleted', async function () {
      const updateStub = sandbox.stub(Event, 'update')
      req.params = { id: events[0].id }

      await softDelete(req, resStub)
      expect(updateStub.calledWith({ status: EVENT_STATUS.DELETED }, { where: { id: events[0].id } })).to.equal(true)
      expect(resStub.status.calledWith(200)).to.equal(true)
      expect(resStub.json.calledWith({ message: 'Event was deleted.' })).to.equal(true)
    })
    it('should return an error if one is caught', async function () {
      const errorMessage = faker.random.words()
      const error = new Error(errorMessage)
      sandbox.stub(Event, 'update').throws(error)

      req.params = { id: faker.random.number() }

      await softDelete(req, resStub)
      expect(errorStub.calledWith(error)).to.equal(true)
      expect(resStub.status.calledWith(500)).to.equal(true)
      expect(resStub.json.calledWith({ message: 'Unable to delete the event.' })).to.equal(true)
    })
  })
})
