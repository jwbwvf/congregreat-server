'use strict'

const fs = require('fs')
const path = require('path')
const XLSX = require('xlsx')

const buf = fs.readFileSync(path.join(__dirname, '..', 'example-spreadsheet', 'congregation-members.ods'))
const workBook = XLSX.read(buf, {type: 'buffer'})
const workSheet = workBook.Sheets[workBook.SheetNames[0]]
const importMembers = XLSX.utils.sheet_to_json(workSheet)

// will have to be hand crafted per congregation
const mappingConfig = {
  Member: {
    firstName: 'first_name',
    lastName: 'last_name',
    email: 'email_address',
    congregationId: 'congregation_id'
  },
  Phone: {
    number: 'phone_number'
  }
}

const map = (mapperConfig, importMembers) => {
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

const result = map(mappingConfig, importMembers)
console.log(JSON.stringify(result))

// result is below (note phone not included since we don't have that in a schema yet)
// [
//   {
//     "Member": {
//       "firstName": "Natalie",
//       "lastName": "Clark",
//       "email": "natcc@example.com"
//     },
//     "Phone": {}
//   },
//   {
//     "Member": {
//       "firstName": "Jenny",
//       "lastName": "Brown",
//       "email": "jenjay@email.com"
//     },
//     "Phone": {}
//   },
//   {
//     "Member": {
//       "firstName": "Paul",
//       "lastName": "Matthews",
//       "email": "paulmm@email.com"
//     },
//     "Phone": {}
//   },
//   {
//     "Member": {
//       "firstName": "Richard",
//       "lastName": "Norris",
//       "email": "RichardLNorris@example.com"
//     },
//     "Phone": {}
//   }
// ]
