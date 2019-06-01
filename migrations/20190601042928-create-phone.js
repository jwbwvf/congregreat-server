'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Phones', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      number: {
        allowNull: false,
        type: Sequelize.STRING
      },
      type: {
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
    return queryInterface.dropTable('Phones')
  }
}
