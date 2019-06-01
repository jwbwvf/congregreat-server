'use strict'

const baseModel = require('../common/baseModel')

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Phones',
      Object.assign(baseModel.getProperties(Sequelize), {
        number: {
          allowNull: false,
          type: Sequelize.STRING
        },
        type: {
          allowNull: false,
          type: Sequelize.STRING
        }
      })
    )
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Phones')
  }
}
