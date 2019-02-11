'use strict';

const uuid = require('uuid')
const { ROLE_STATUS } = require('../common/status')

const actions = ['create', 'read', 'update', 'delete']
const permissions = {
  entities: [
    {name: 'role', actions },
    {name: 'user', actions },
    {name: 'attendance', actions },
    {name: 'congregation', actions },
    {name: 'member', actions },
    {name: 'userRole', actions }
  ]
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = await queryInterface.sequelize.query(
      `SELECT id from Users;`
    )

    const userId = users[0][0].id

    return queryInterface.bulkInsert('Roles', [{
      id: uuid.v4(),
      name: 'SYSTEM ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: JSON.stringify(permissions),
      createdBy: userId,
      updatedBy: userId,
      status: ROLE_STATUS.NEW
    }], {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Roles', null, {})
  }
};
