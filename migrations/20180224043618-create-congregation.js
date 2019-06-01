'use strict'

const baseModel = require('../common/baseModel')

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Congregations',
      Object.assign(baseModel.getProperties(Sequelize), {
        name: {
          allowNull: false,
          unique: true,
          type: Sequelize.STRING
        },
        status: {
          allowNull: false,
          type: Sequelize.STRING
        }
      })
    )
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Congregations')
  }
}
