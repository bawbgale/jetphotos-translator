'use strict'
const fs = require('fs')
const path = require('path')
const dir = 'cache'

function cachefile (tailNum) {
  return path.join(__dirname, dir, `${tailNum}.html`)
}

module.exports.save = async (tailNum, data) => {
  if (tailNum && data) {
    !fs.existsSync(dir) && fs.mkdirSync(dir)
    const filename = cachefile(tailNum)
    await fs.writeFile(filename, data, (err) => {
      if (err) throw err
      // console.log('Saved file:', filename)
      return filename
    })
  } else {
    return null
  }
}

module.exports.exists = (tailNum) => {
  return fs.existsSync(cachefile(tailNum))
}

module.exports.retrieve = (tailNum) => {
  const filename = cachefile(tailNum)
  // console.log('Reading from cache:', filename)
  try {
    const fileData = fs.readFileSync(filename, 'utf8')
    return [null, fileData]
  } catch (error) {
    return [error]
  }
}
