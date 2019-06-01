'use strict'

const baseModel = require('../common/baseModel')

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Attendances',
      Object.assign(baseModel.getProperties(Sequelize), {
        memberId: {
          type: Sequelize.UUID,
          references: {
            model: 'Members',
            key: 'id',
            allowNull: false
          }
        },
        eventId: {
          type: Sequelize.UUID,
          references: {
            model: 'Event',
            key: 'id',
            allowNull: false
          }
        }
      })
    )
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Attendances')
  }
}
