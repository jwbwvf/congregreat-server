'use strict'

module.exports.map = (mapperConfig, importMembers) => {
  return importMembers.map(importMember => {
    return Object.keys(mapperConfig).reduce((mapper, mapperKey) => ({
      ...mapper,
      [mapperKey]: Object.keys(mapperConfig[mapperKey]).reduce((child, childKey) => ({
        ...child,
        [childKey]: importMember[mapperConfig[mapperKey][childKey]]
      }), {})
    }), {})
  })
}
