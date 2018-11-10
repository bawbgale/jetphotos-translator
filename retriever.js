'use strict'
const request = require('axios')
const cheerio = require('cheerio')

module.exports.fetchJetPhotos = async (tailNum, callback) => {
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
