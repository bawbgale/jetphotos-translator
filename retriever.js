'use strict'
const request = require('axios')
const cheerio = require('cheerio')

module.exports.getjetphotos = async (tailNum, callback) => {
  console.log(`Retriever received tailNum ${tailNum}`)
  try {
    const response = await request(jetPhotosUrl(tailNum))
    console.log(`Retriever request responded with data of length ${Object.keys(response.data).length}`)
    const photos = extractPhotos(response.data)
    callback(photos)
  } catch (error) {
    let err
    if (error.response) {
      err = `[${error.response.status}] Retriever request responded with error ${error.response.status}`
    } else if (error.request) {
      err = '[400] Request was made but no response was received'
    } else {
      // Something happened in setting up the request that triggered an Error
      err = `[400] ${error.message}`
    }
    console.log(err)
    callback(err)
  }
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
