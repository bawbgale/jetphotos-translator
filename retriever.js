'use strict'
const request = require('axios')
const cheerio = require('cheerio')

module.exports.getjetphotos = async (tailNum, callback) => {
  return request(jetPhotosUrl(tailNum))
    .then(({ data }) => {
      const photos = extractPhotos(data)
      callback(photos)
    })
    .catch((error) => {
      if (error.response) {
        callback(new Error(error.response.status))
      } else if (error.request) {
        callback(new Error('Request was made but no response was received'))
      } else {
        // Something happened in setting up the request that triggered an Error
        callback(error.message)
      }
    })
}

function jetPhotosUrl (tailNum) {
  return `https://www.jetphotos.com/registration/${tailNum}`
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
