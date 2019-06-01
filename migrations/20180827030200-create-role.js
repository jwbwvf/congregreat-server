'use strict'

const baseModel = require('../common/baseModel')

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Roles',
      Object.assign(baseModel.getProperties(Sequelize), {
        name: {
          allowNull: false,
          type: Sequelize.STRING
        },
        status: {
          allowNull: false,
          type: Sequelize.STRING
        },
        permissions: {
          allowNull: false,
          type: Sequelize.JSON
        }
      })
    )
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Roles')
  }
}
