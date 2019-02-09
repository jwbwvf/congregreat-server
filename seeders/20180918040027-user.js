'use strict'

const uuid = require('uuid')
const faker = require('faker')
const { generateSalt, generateHash } = require('../common/security')
const { USER_STATUS } = require('../common/status')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const members = await queryInterface.sequelize.query(
      `SELECT id, email from Members;`
    )

    const memberRows = members[0]

    const password = faker.internet.password(8)
    const salt = generateSalt()
    const hash = generateHash(salt, password)

    console.log(`seed user=[${memberRows[0].email}] password=[${password}]`)

    return queryInterface.bulkInsert('Users', [{
      id: uuid.v4(),
      email: memberRows[0].email,
      status: USER_STATUS.VERIFIED,
      hash,
      salt,
      memberId: memberRows[0].id,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {})
  }
}
