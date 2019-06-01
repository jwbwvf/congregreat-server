'use strict'

const baseModel = require('../common/baseModel')

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Events',
      Object.assign(baseModel.getProperties(Sequelize), {
        name: {
          allowNull: false,
          type: Sequelize.STRING
        },
        status: {
          allowNull: false,
          type: Sequelize.STRING
        },
        description: {
          allowNull: true,
          type: Sequelize.STRING
        },
        startDate: {
          allowNull: false,
          type: Sequelize.DATEONLY
        },
        endDate: {
          allowNull: false,
          type: Sequelize.DATEONLY
        },
        startTime: {
          allowNull: false,
          type: Sequelize.TIME
        },
        endTime: {
          allowNull: false,
          type: Sequelize.TIME
        },
        congregationId: {
          type: Sequelize.UUID,
          allowNull: false,
          unique: true,
          references: {
            model: 'Congregations',
            key: 'id'
          }
        }
      })
    )
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Events')
  }
}
