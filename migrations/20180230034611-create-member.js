'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Members', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
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
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Members')
  }
}
