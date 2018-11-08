'use strict'
const request = require('axios')
const cheerio = require('cheerio')

module.exports.getjetphoto = async (event, context, callback) => {
  const tailNum = event.tailNum
  return fetchJetPhotos(tailNum, (result) => {
    context.succeed(wrapHtml(result[0]))
  })
}

function fetchJetPhotos (tailNum, callback) {
  return request(jetPhotosUrl(tailNum))
    .then(({ data }) => {
      const photos = extractPhotos(data)
      callback(photos)
    })
    .catch((err) => {
      callback(err.response)
    })
}

function jetPhotosUrl (tailNum) {
  return `https://www.jetphotos.com/photo/keyword/${tailNum}`
}

function extractPhotos (data) {
  const $ = cheerio.load(data)
  const photoElements = $('img.result__photo')
  const photos = []
  photoElements.each((i, el) => {
    photos.push($(el).attr('src'))
  })
  return photos
}

function wrapHtml (photo) {
  return `<html><img style="max-width: 500px;" src="${photo}"/></html>`
}
