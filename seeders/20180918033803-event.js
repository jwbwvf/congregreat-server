'use strict'

const uuid = require('uuid')
const faker = require('faker')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const congregations = await queryInterface.sequelize.query(
      `SELECT id from Congregations;`
    )

    const congregationRows = congregations[0]

    const today = new Date()
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    return queryInterface.bulkInsert('Events', [{
      id: uuid.v4(),
      name: faker.random.words(2),
      startDate: tomorrow,
      endDate: tomorrow,
      startTime: '9:00',
      endTime: '10:00',
      congregationId: congregationRows[0].id,
      createdAt: today,
      updatedAt: today,
      status: 'CREATED',
      createdBy: 1,
      updatedBy: 1
    }], {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Events', null, {})
  }
}
