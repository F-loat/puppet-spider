const path = require('path')

exports.resolve = (...p) => path.join(process.cwd(), ...p)
