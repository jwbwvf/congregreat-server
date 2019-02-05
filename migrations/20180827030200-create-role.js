'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Roles', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      status: {
        allowNull: false,
        type: Sequelize.STRING
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
        allowNull: false,
        type: Sequelize.UUID
      },
      updatedBy: {
        allowNull: false,
        type: Sequelize.UUID
      },
      permissions: {
        allowNull: false,
        type: Sequelize.JSON
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Roles')
  }
}
