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
        type: Sequelize.STRING
      },
      congregationId: {
        type: Sequelize.UUID,
        references: {
          model: 'Congregations',
          key: 'id',
          allowNull: false
        }
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
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Roles')
  }
}
