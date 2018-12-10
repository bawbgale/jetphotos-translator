'use strict'
const path = require('path')
const retriever = require(path.join(__dirname, '//retriever.js'))

module.exports.getjetphoto = async (event, context, callback) => {
  if (event.tailNum) {
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
  } else {
    console.log('No tailNum')
    callback(null, 'Please pass a tail number on the query string or in the request body')
  }
}

module.exports.getjetphotoazure = async (context, req) => {
  if (req.query.tailNum || req.body.tailNum) {
    const tailNum = (req.query.tailNum || req.body.tailNum)
    return retriever.getjetphotos(tailNum, (result) => {
      if (!Array.isArray(result)) {
        context.log(`Retriever error ${result}`)
        return context.res
          .status(400)
          .type('text/html')
          .send(new Error(result))
      } else if (result.length === 0) {
        context.log('No photos :-(')
        return context.res
          .status(204)
          .type('text/html')
          .send('No photos :-(')
      } else {
        context.log(`Retrieved ${result.length} photo URLs`)
        return context.res
          .status(200)
          .type('text/html')
          .send(wrapHtml(imgTag(result[0])))
      }
    })
  } else {
    context.log('No tailNum')
    return context.res
      .status(400)
      .type('text/html')
      .send('Please pass a tail number on the query string or in the request body')
  }
}

function imgTag (photo) {
  return `<img style="max-width: 500px;" src="https:${photo}"/>`
}

function wrapHtml (content) {
  return `<html><body>${content}</body></html>`
}
