'use strict'

const fs = require('fs')
const XLSX = require('xlsx')

module.exports.import = (file) => {
  const buf = fs.readFileSync(file)
  const workBook = XLSX.read(buf, {type: 'buffer'})
  const workSheet = workBook.Sheets[workBook.SheetNames[0]]
  return XLSX.utils.sheet_to_json(workSheet)
}
