'use strict'

module.exports = (sequelize, DataTypes) => {
  var Attendance = sequelize.define('Attendance', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at'
    }
  }, {})
  Attendance.associate = function (models) {
    Attendance.belongsTo(models.Member, {
      foreignKey: {
        name: 'memberId',
        field: 'member_id',
        allowNull: false
      }
    })
    Attendance.belongsTo(models.Congregation, {
      foreignKey: {
        name: 'congregationId',
        field: 'congregation_id',
        allowNull: false
      }
    })
  }
  return Attendance
}
