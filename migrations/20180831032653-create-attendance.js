'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Attendances', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      congregationId: {
        type: Sequelize.UUID,
        field: 'congregation_id',
        references: {
          model: 'Congregations',
          key: 'id',
          allowNull: false
        }
      },
      memberId: {
        type: Sequelize.UUID,
        field: 'member_id',
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
