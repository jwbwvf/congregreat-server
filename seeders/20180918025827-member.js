'use strict'

const uuid = require('uuid')
const faker = require('faker')
const { MEMBER_STATUS } = require('../common/status')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const congregations = await queryInterface.sequelize.query(
      `SELECT id from Congregations;`
    )

    const congregationRows = congregations[0]

    return queryInterface.bulkInsert('Members', [{
      id: uuid.v4(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      status: MEMBER_STATUS.ACTIVE,
      congregationId: congregationRows[0].id,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Members', null, {})
  }
}
