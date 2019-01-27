'use strict'
const path = require('path')
const retriever = require(path.join(__dirname, '//retriever.js'))

module.exports.getjetphoto_aws = async (event, context) => {
  let tailNum
  if (event.tailNum || event.queryStringParameters.tailNum || JSON.parse(event.body).tailNum) {
    tailNum = (event.tailNum || event.queryStringParameters.tailNum || JSON.parse(event.body).tailNum)
  }
  let response = await getjetphoto(tailNum)
  console.log(response.log)
  return {
    headers: { 'Content-Type': 'text/html' },
    statusCode: response.status,
    body: response.body
  }
}

module.exports.getjetphoto_azure = async (context, req) => {
  let tailNum
  if (req.query.tailNum || req.body.tailNum) {
    tailNum = (req.query.tailNum || req.body.tailNum)
  }
  let response = await getjetphoto(tailNum)
  context.log(response.log)
  context.res
    .type('text/html')
    .status(response.status)
    .send(response.body)
}

exports.getjetphoto_google = async (req, res) => {
  let tailNum
  if (req.query.tailNum || req.body.tailNum) {
    tailNum = (req.query.tailNum || req.body.tailNum)
  }
  let response = await getjetphoto(tailNum)
  console.log(response.log)
  res
    .type('text/html')
    .status(response.status)
    .send(response.body)
}

async function getjetphoto (tailNum) {
  let response = {}
  if (tailNum) {
    const result = await retriever.getjetphotos(tailNum)
    if (!Array.isArray(result)) {
      response.log = `Retriever error ${result}`
      response.status = +result.match(/\[(\d+)\]/)[1] || 400
      response.body = result
    } else if (result.length === 0) {
      response.log = 'No photos :-('
      response.status = 204
      response.body = wrapHtml('No photos :-(')
    } else {
      response.log = `Retrieved ${result.length} photo URLs`
      response.status = 200
      response.body = wrapHtml(imgTag(result[0]))
    }
  } else {
    response.log = 'No tailNum'
    response.status = 400
    response.body = 'Please pass a tail number on the query string or in the request body'
  }
  return response
}

function imgTag (photo) {
  let html = `
    <figure>
      <img style="max-width: 500px;" src="https:${photo.photo_url}" alt="">
      <figcaption>Photo by ${photo.photog}</figcaption>
    </figure>`
  return html
}

function wrapHtml (content) {
  return `<html><body>${content}</body></html>`
}
