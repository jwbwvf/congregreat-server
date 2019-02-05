'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('UserRoles', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
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
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      createdBy: {
        type: Sequelize.UUID,
        allowNull: false
      },
      updatedBy: {
        type: Sequelize.UUID,
        allowNull: false
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('UserRoles')
  }
}
