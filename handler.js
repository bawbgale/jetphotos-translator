'use strict'
const path = require('path')
const retriever = require(path.join(__dirname, '//retriever.js'))

module.exports.getjetphoto = async (event, context, callback) => {
  let response = { headers: { 'Content-Type': 'text/html' } }
  if (event.tailNum || event.queryStringParameters.tailNum || JSON.parse(event.body).tailNum) {
    const tailNum = (event.tailNum || event.queryStringParameters.tailNum || JSON.parse(event.body).tailNum)
    const result = await retriever.getjetphotos(tailNum)
    if (!Array.isArray(result)) {
      console.log(`Retriever error ${result}`)
      response.statusCode = +result.match(/\[(\d+)\]/)[1] || 400
      response.body = result
      callback(null, response)
    } else if (result.length === 0) {
      console.log(`No photos :-(`)
      response.statusCode = 204
      response.body = wrapHtml('No photos :-(')
      callback(null, response)
    } else {
      console.log(`Retrieved ${result.length} photo URLs`)
      response.statusCode = 200
      response.body = wrapHtml(imgTag(result[0]))
      callback(null, response)
    }
  } else {
    console.log('No tailNum')
    response.statusCode = 400
    response.body = 'Please pass a tail number on the query string or in the request body'
    callback(null, response)
  }
}

module.exports.getjetphotoazure = async (context, req) => {
  if (req.query.tailNum || req.body.tailNum) {
    const tailNum = (req.query.tailNum || req.body.tailNum)
    const result = await retriever.getjetphotos(tailNum)
    if (!Array.isArray(result)) {
      context.log(`Retriever error ${result}`)
      return context.res
        .status(result.match(/\[(\d+)\]/)[1] || 400)
        .type('text/html')
        .send(result)
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
  } else {
    context.log('No tailNum')
    return context.res
      .status(400)
      .type('text/html')
      .send('Please pass a tail number on the query string or in the request body')
  }
}

function imgTag (photo) {
  return `<img style="max-width: 500px;" src="https:${photo.photo_url}"/>`
}

function wrapHtml (content) {
  return `<html><body>${content}</body></html>`
}
