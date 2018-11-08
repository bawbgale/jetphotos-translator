'use strict'
const request = require('axios')
const cheerio = require('cheerio')

module.exports.getjetphoto = async (event, context, callback) => {
  const tailNum = event.tailNum
  return request(jetPhotosUrl(tailNum))
    .then(({ data }) => {
      const $ = cheerio.load(data)
      const photoElements = $('img.result__photo')
      const photos = []
      photoElements.each((i, el) => {
        photos.push($(el).attr('src'))
      })
      var html = wrapHtml(photos[0])
      context.succeed(html)
    })
    .catch((err) => {
      context.succeed(err.response)
    })
}
function jetPhotosUrl (tailNum) {
  return `https://www.jetphotos.com/photo/keyword/${tailNum}`
}

function wrapHtml (photo) {
  return `<html><img style="max-width: 500px;" src="${photo}"/></html>`
}
