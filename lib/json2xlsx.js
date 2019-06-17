const fs = require('fs')
const xlsx = require('node-xlsx')
const { resolve } = require('./utils')

module.exports = (infos, keyword, area) => {
  const data = infos.map(info => Object.values(info))
  
  const buffer = xlsx.build([{ name: 'Sheet', data }])
  
  const filePath = resolve(`赶集网-${keyword}-${area}.xlsx`)

  fs.writeFileSync(filePath, buffer)
}
