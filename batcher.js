'use strict'
const path = require('path')
const fs = require('fs')
const Papa = require('papaparse')
const Bottleneck = require('bottleneck')
const retriever = require(path.join(__dirname, '//retriever.js'))
const cacher = require(path.join(__dirname, '//cacher.js'))

let bottleneckRefreshInterval = 100 * 1000 // must be divisible by 250
let bottleneckOptions = {
  maxConcurrent: 1,
  minTime: 200,
  reservoir: 25, // initial value
  reservoirRefreshAmount: 25,
  reservoirRefreshInterval: bottleneckRefreshInterval
}
const limiter = new Bottleneck(bottleneckOptions)

module.exports.getjetphotobatch = (inputFile = 'tail_numbers.csv', tailNumCol = 'Tail Number') => {
  // read filename from command line input (start with hardcoded file name)
  fs.readFile(inputFile, 'utf8', (err, fileData) => {
    if (err) throw err
    // validate the file exists and try to parse as CSV
    console.log(`Reading file ${inputFile}`)
    Papa.parse(fileData, {
      header: true,
      skipEmptyLines: true,
      preview: 900, // getting errors with 1000+ rows
      error: (err) => {
        throw err
      },
      complete: (results) => {
        // validate file content
        if (results.data.length === 0) throw new Error(`File '${inputFile}' is empty!`)
        if (!results.meta.fields.includes(tailNumCol)) throw new Error(`Column '${tailNumCol}' not found!`)
        if (results.errors.length > 0) console.log('Parsing errors:', '\n', results.errors)

        const startTime = new Date()
        let errorCount = 0
        let aircraftList = results.data

        // don't reprocess tail numbers that were successfully processed before
        let unprocessedAircraft = []
        if (results.meta.fields.includes('Status')) {
          unprocessedAircraft = aircraftList.filter(row => !['Success', 'No photos'].includes(row['Status']))
        } else {
          unprocessedAircraft = aircraftList
        }

        let aircraftListWithPhotos = unprocessedAircraft.map((row, i) => {
          // return an array of promises that will get resolved with retriever responds
          return new Promise(async (resolve, reject) => {
            let tailNum = row[tailNumCol]
            // call jet photos retriever
            // for now, passing 'true' enables caching, which currently works locally but not on cloud
            const [cached, result] = cacher.exists(tailNum)
              ? [true, await retriever.getjetphotos(tailNum, true)]
              : [false, await limiter.schedule(() => retriever.getjetphotos(tailNum, true))]
            let aircraftListItem = {
              tailNum: tailNum,
              status: null,
              photoUrlBatch: null
            }
            let endTime = new Date()
            let timeDiff = endTime - startTime
            let info = `(${i + 1} of ${unprocessedAircraft.length} at ${timeDiff} ms ${cached ? 'CACHED' : ''}) ${tailNum}:`
            // catch any errors (i.e. not an array)
            if (!Array.isArray(result)) {
              aircraftListItem.status = `Retriever error ${result}`
              console.log(info, `Retriever error ${result}`)
              errorCount++
              resolve(aircraftListItem)
            } else if (result.length === 0) {
              aircraftListItem.status = 'No photos'
              console.log(info, `No photos :-(`)
              resolve(aircraftListItem)
            } else {
              // if we got photo urls, add them to response
              aircraftListItem.status = 'Success'
              aircraftListItem.photoUrlBatch = result
              console.log(info, `Retrieved ${result.length} photo URLs`)
              resolve(aircraftListItem)
            }
          })
        })

        // write output after all promises resolved
        Promise.all(aircraftListWithPhotos).then(aircraftListWithPhotos => {
          // create an log file with all the original rows plus status
          // pass through previous successful status if it was in original file
          let aircraftStatusList = aircraftList.map(row => {
            if (aircraftListWithPhotos.find(photoRow => photoRow.tailNum === row[tailNumCol])) {
              row['Status'] = aircraftListWithPhotos.find(photoRow => photoRow.tailNum === row[tailNumCol]).status
            }
            return row
          })
          console.log(`Processed ${aircraftListWithPhotos.length} tail numbers`)

          // dump all the photos urls to a separate table
          let photosUrlList = []
          for (let aircraft of aircraftListWithPhotos) {
            if (Array.isArray(aircraft.photoUrlBatch) && aircraft.photoUrlBatch.length > 0) {
              let photoArray = aircraft.photoUrlBatch.map(photoUrl => {
                return {
                  tailNum: aircraft.tailNum,
                  photoUrl: photoUrl
                }
              })
              photosUrlList.push.apply(photosUrlList, photoArray)
            }
          }
          console.log(`Retrieved ${photosUrlList.length} photo URLs`)

          // path/foo.csv => path/foo.status.1.csv & path/foo.photos.1.csv
          // path/foo.statusN.csv => path/foo.status.N+1.csv & path/foo.photos.N+1.csv
          const [root, iteration] = filenameParser(inputFile)
          outputCsv(aircraftStatusList, root, 'status', iteration)
          outputCsv(photosUrlList, root, 'photos', iteration)

          if (errorCount > 0) {
            console.log(`Encountered ${errorCount} errors`)
            console.log(`You can retry only those tail numbers by running:`)
            console.log(`node batcher.js getjetphotobatch '${root}.status.${iteration}.csv' '${tailNumCol}'`)
          }
        })

        const filenameParser = (inputFile) => {
          const re = /^(.*?)(?:\.status\.(\d*))?(?:\.csv)$/i
          let [, root, n] = inputFile.match(re)
          let increment = n ? ++n : 1
          return [root, increment]
        }

        const outputCsv = (data, root, suffix, iteration) => {
          let csv = Papa.unparse(data)
          let filename = root + '.' + suffix + '.' + iteration + '.csv'
          fs.writeFile(filename, csv, (err) => {
            if (err) throw err
            console.log('Saved file:', filename)
          })
        }
      }
    })
  })
}

require('make-runnable')
