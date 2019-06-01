module.exports = {
  getProperties: types => {
    return {
      id: {
        allowNull: false,
        primaryKey: true,
        type: types.UUID
      },
      createdAt: {
        allowNull: false,
        type: types.DATE
      },
      updatedAt: {
        allowNull: false,
        type: types.DATE
      },
      createdBy: {
        allowNull: false,
        type: types.UUID
      },
      updatedBy: {
        allowNull: false,
        type: types.UUID
      }
    }
  }
}
