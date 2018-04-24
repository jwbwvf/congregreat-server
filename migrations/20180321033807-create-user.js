'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      email: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING
      },
      verified: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      hash: {
        allowNull: false,
        type: Sequelize.STRING
      },
      salt: {
        allowNull: false,
        type: Sequelize.STRING
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
      firstName: {
        allowNull: false,
        type: Sequelize.STRING,
        field: 'first_name'
      },
      lastName: {
        allowNull: false,
        type: Sequelize.STRING,
        field: 'last_name'
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users')
  }
}
