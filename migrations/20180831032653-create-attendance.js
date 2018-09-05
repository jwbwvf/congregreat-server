'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Attendances', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      memberId: {
        type: Sequelize.UUID,
        references: {
          model: 'Members',
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
    return queryInterface.dropTable('Attendances')
  }
}
