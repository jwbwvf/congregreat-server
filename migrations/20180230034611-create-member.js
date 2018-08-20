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
        type: Sequelize.STRING,
        field: 'last_name'
      },
      lastName: {
        allowNull: false,
        type: Sequelize.STRING,
        field: 'first_name'
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
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'created_at'
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'updated_at'
      },
      congregationId: {
        type: Sequelize.UUID,
        field: 'congregation_id',
        references: {
          model: 'Congregations',
          key: 'id',
          allowNull: false
        }
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Members')
  }
}
