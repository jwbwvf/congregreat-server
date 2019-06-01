'use strict'

const baseModel = require('../common/baseModel')

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('UserRoles',
      Object.assign(baseModel.getProperties(Sequelize), {
        userId: {
          allowNull: false,
          type: Sequelize.UUID,
          unique: 'uniqueTag',
          references: {
            model: 'Users',
            key: 'id'
          }
        },
        roleId: {
          allowNull: false,
          type: Sequelize.UUID,
          unique: 'uniqueTag',
          references: {
            model: 'Roles',
            key: 'id'
          }
        },
        status: {
          allowNull: false,
          type: Sequelize.STRING,
          unique: 'uniqueTag'
        }
      })
    )
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('UserRoles')
  }
}
