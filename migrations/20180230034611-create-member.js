'use strict'

const baseModel = require('../common/baseModel')

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Members',
      Object.assign(baseModel.getProperties(Sequelize), {
        firstName: {
          allowNull: false,
          type: Sequelize.STRING
        },
        lastName: {
          allowNull: false,
          type: Sequelize.STRING
        },
        email: {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: null,
          unique: true
        },
        status: {
          type: Sequelize.STRING,
          allowNull: false
        },
        congregationId: {
          type: Sequelize.UUID,
          references: {
            model: 'Congregations',
            key: 'id',
            allowNull: false
          }
        }
      })
    )
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Members')
  }
}
