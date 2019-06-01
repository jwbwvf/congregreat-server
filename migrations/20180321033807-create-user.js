'use strict'

const baseModel = require('../common/baseModel')

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users',
      Object.assign(baseModel.getProperties(Sequelize), {
        email: {
          allowNull: false,
          unique: true,
          type: Sequelize.STRING
        },
        status: {
          allowNull: false,
          type: Sequelize.STRING
        },
        hash: {
          allowNull: false,
          type: Sequelize.STRING
        },
        salt: {
          allowNull: false,
          type: Sequelize.STRING
        },
        memberId: {
          type: Sequelize.UUID,
          allowNull: false,
          unique: true,
          references: {
            model: 'Members',
            key: 'id'
          }
        }
      })
    )
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users')
  }
}
