'use strict'
const fs = require('fs')
const Papa = require('papaparse')
const retriever = require('./retriever.js')

module.exports.getjetphotobatch = (inputFile = 'tail_numbers.csv', tailNumCol = 'Tail Number') => {
  // read filename from command line input (start with hardcoded file name)
  fs.readFile(inputFile, 'utf8', (err, fileData) => {
    if (err) throw err
    // validate the file exists and try to parse as CSV
    console.log(`Reading file ${inputFile}`)
    Papa.parse(fileData, {
      header: true,
      skipEmptyLines: true,
      error: (err) => {
        throw err
      },
      complete: (results) => {
        // validate file content
        if (results.data.length === 0) throw new Error(`File '${inputFile}' is empty!`)
        if (!results.meta.fields.includes(tailNumCol)) throw new Error(`Column '${tailNumCol}' not found!`)
        if (results.errors.length > 0) console.log('Parsing errors:', '\n', results.errors)

        let aircraftList = results.data
        let aircraftListWithPhotos = aircraftList.map(row => {
          // return an array of promises that will get resolved with retriever responds
          return new Promise((resolve, reject) => {
            let tailNum = row[tailNumCol]
            // call jet photos retriever
            retriever.getjetphotos(tailNum, (result) => {
              let aircraftListItem = {
                tailNum: tailNum,
                status: null,
                photoUrlBatch: null
              }
              // catch any errors (i.e. not an array)
              if (!Array.isArray(result)) {
                aircraftListItem.status = 'Retriever error'
                console.log(`${tailNum}: Retriever error`, '\n', result)
              } else if (result.length === 0) {
                aircraftListItem.status = 'No photos'
                console.log(`${tailNum}: No photos :-(`)
              } else {
                // if we got photo urls, add them to response
                aircraftListItem.status = 'Success'
                aircraftListItem.photoUrlBatch = result
                console.log(`${tailNum}: Retrieved ${result.length} photo URLs`)
              }
              resolve(aircraftListItem)
            })
          })
        })
        // write output after all promises resolved
        Promise.all(aircraftListWithPhotos).then(aircraftListWithPhotos => {
          // create an log file with all the original rows plus status
          let aircraftStatusList = aircraftList.map(row => {
            row['Status'] = aircraftListWithPhotos.find(photoRow => photoRow.tailNum === row[tailNumCol]).status
            return row
          })

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

          outputCsv('status', aircraftStatusList)
          outputCsv('photos', photosUrlList)
        })

        const outputCsv = (suffix, data) => {
          let csv = Papa.unparse(data)
          let filename = inputFile.replace(/(\.csv)$/gi, `_${suffix}.csv`)
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
