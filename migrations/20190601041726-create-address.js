'use strict'

const baseModel = require('../common/baseModel')

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Addresses',
      Object.assign(baseModel.getProperties(Sequelize), {
        addressLine1: {
          allowNull: false,
          type: Sequelize.STRING
        },
        addressLine2: {
          type: Sequelize.STRING
        },
        city: {
          allowNull: false,
          type: Sequelize.STRING
        },
        state: {
          allowNull: false,
          type: Sequelize.STRING
        },
        zipCode: {
          allowNull: false,
          type: Sequelize.STRING
        }
      })
    )
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Addresses')
  }
}
