'use strict'
const request = require('axios')
const cheerio = require('cheerio')

module.exports.getjetphotos = async (tailNum, callback) => {
  console.log(`Retriever received tailNum ${tailNum}`)
  return request(jetPhotosUrl(tailNum))
    .then(({ data }) => {
      console.log(`Retriever request responded with data of length ${Object.keys(data).length}`)
      const photos = extractPhotos(data)
      callback(photos)
    })
    .catch((error) => {
      let err
      if (error.response) {
        err = new Error(error.response.status)
        console.log(`Retriever request responded with error ${err}`)
      } else if (error.request) {
        err = new Error('Request was made but no response was received')
        console.log(err)
      } else {
        // Something happened in setting up the request that triggered an Error
        err = error.message
        console.log(err)
      }
      callback(err)
    })
}

function jetPhotosUrl (tailNum) {
  const requestUrl = `https://www.jetphotos.com/registration/${tailNum}`
  console.log(`Retriever requested URL ${requestUrl}`)
  return requestUrl
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
