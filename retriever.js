'use strict'
const path = require('path')
const request = require('axios')
const cheerio = require('cheerio')
const cacher = require(path.join(__dirname, '//cacher.js'))

module.exports.getjetphotos = async (tailNum, useCache = false) => {
  // console.log(`Retriever received tailNum ${tailNum}`)
  // option to read from and write to local cache to avoid repeatedly re-requesting pages
  const [err, page] = (useCache && cacher.exists(tailNum))
    ? cacher.retrieve(tailNum)
    : await retrieve(tailNum, useCache)
  const photos = err || extractPhotosPhotogs(page)
  return photos
}

async function retrieve (tailNum, useCache = false) {
  try {
    const response = await request(jetPhotosUrl(tailNum))
    // console.log(`Retriever request responded with data of length ${Object.keys(response.data).length}`)
    if (useCache) { cacher.save(tailNum, response.data) }
    return [null, response.data]
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
    console.log('Retriever error:', err)
    return [err, null]
  }
}

function jetPhotosUrl (tailNum) {
  const requestUrl = `https://www.jetphotos.com/registration/${tailNum}`
  // console.log(`Retriever requested URL ${requestUrl}`)
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

function extractPhotosPhotogs (data) {
  const $ = cheerio.load(data)
  return $('div.result').map((i, el) => {
    let result = {}
    result.photo_url = $('img.result__photo', el).attr('src')
    result.photog = $('span.result__infoListText--photographer', el).text()
    return result
  }).get()
}
