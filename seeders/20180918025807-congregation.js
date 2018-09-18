'use strict'

const uuid = require('uuid')
const faker = require('faker')
const { CONGREGATION_STATUS } = require('../common/status')

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Congregations', [{
      id: uuid.v4(),
      name: faker.name.findName(),
      status: CONGREGATION_STATUS.NEW,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Congregations', null, {})
  }
}
