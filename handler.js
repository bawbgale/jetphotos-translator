'use strict'
const retriever = require('./retriever.js')

module.exports.getjetphoto = async (event, context, callback) => {
  const tailNum = event.tailNum
  return retriever.getjetphotos(tailNum, (result) => {
    context.succeed(wrapHtml(result[0]))
  })
}

function wrapHtml (photo) {
  return `<html><img style="max-width: 500px;" src="${photo}"/></html>`
}
