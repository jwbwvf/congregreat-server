'use strict';

const uuid = require('uuid')
const { USER_ROLE_STATUS } = require('../common/status')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = await queryInterface.sequelize.query(
      `SELECT id from Users;`
    )
    
    const userId = users[0][0].id

    const roles = await queryInterface.sequelize.query(
      `SELECT id FROM Roles WHERE name = 'SYSTEM ADMIN' LIMIT 1;`
    )

    const roleId = roles[0][0].id

    return queryInterface.bulkInsert('UserRoles', [{
      id: uuid.v4(),
      status: USER_ROLE_STATUS.NEW,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId,
      updatedBy: userId,
      userId,
      roleId
    }], {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('UserRoles', null, {})
  }
};
