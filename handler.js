'use strict'
const path = require('path')
const retriever = require(path.join(__dirname, '//retriever.js'))

module.exports.getjetphoto = async (event, context, callback) => {
  const tailNum = event.tailNum
  return retriever.getjetphotos(tailNum, (result) => {
    if (!Array.isArray(result)) {
      console.log(`Retriever error ${result}`)
      callback(new Error(result))
    } else if (result.length === 0) {
      console.log(`No photos :-(`)
      callback(null, wrapHtml('No photos :-('))
    } else {
      console.log(`Retrieved ${result.length} photo URLs`)
      callback(null, wrapHtml(imgTag(result[0])))
    }
  })
}

function imgTag (photo) {
  return `<img style="max-width: 500px;" src="https:${photo}"/>`
}

function wrapHtml (content) {
  return `<html><body>${content}</body></html>`
}
