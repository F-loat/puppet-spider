const fs = require('fs')
const utf8 = require('utf8')
const quotedPrintable = require('quoted-printable')
const { resolve } = require('./utils')

module.exports = (infos, keyword, area) => {
  const data = infos.reduce((result, current) => `${result}
    BEGIN:VCARD
    VERSION:2.1
    FN;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:${quotedPrintable.encode(utf8.encode(current.name))}
    TEL;CELL:${current.phonenumber}
    END:VCARD
  `, '')

  const filePath = resolve(`赶集网-${keyword}-${area}.vcf`)

  fs.writeFileSync(filePath, data)
}