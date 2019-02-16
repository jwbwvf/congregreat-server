module.exports.isSystemAdmin = ({ entities = [] }) => {
  return !!entities.find(entity => entity.name === '*' && entity.actions[0] === '*')
}
