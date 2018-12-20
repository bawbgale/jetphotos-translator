const chai = require('chai')
const sinonChai = require('sinon-chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(sinonChai)
chai.use(dirtyChai)

const fs = require('fs')
const mockfs = require('mock-fs')

const batcher = require('../batcher.js')
const retriever = require('../retriever.js')

const sandbox = require('sinon').createSandbox()

let inputFilename = 'tail_numbers.csv'
let tailNumCol = 'Tail Number'
let inputCSV = `Some Column,Tail Number
foo,0PhotoTail
bar,1PhotoTail
foo,2PhotoTail
bar,ErrTail`

let outputStatusFilename = 'tail_numbers.status.1.csv'
let outputStatusCSV = `Some Column,Tail Number,Status\r
foo,0PhotoTail,No photos\r
bar,1PhotoTail,Success\r
foo,2PhotoTail,Success\r
bar,ErrTail,Retriever error Error message`

let outputPhotosFilename = 'tail_numbers.photos.1.csv'
let outputPhotosCSV = `tailNum,photoUrl\r
1PhotoTail,photo_url1.1\r
2PhotoTail,photo_url2.1\r
2PhotoTail,photo_url2.2`

describe('batcher', () => {
  beforeEach(() => {
    mockfs({
      'tail_numbers.csv': inputCSV
    })
    let retrieverStub = sandbox.stub(retriever, 'getjetphotos')
    retrieverStub.withArgs('0PhotoTail').resolves([])
    retrieverStub.withArgs('1PhotoTail').resolves(['photo_url1.1'])
    retrieverStub.withArgs('2PhotoTail').resolves(['photo_url2.1', 'photo_url2.2'])
    retrieverStub.withArgs('ErrTail').resolves('Error message')
  })

  afterEach(() => {
    mockfs.restore()
    sandbox.restore()
  })

  it('reads input CSV specified on command line')

  it('throws error if no valid input CSV')

  it('retrieves photo urls for each tail number in input CSV')

  it('writes status and photo CSVs', (done) => {
    batcher.getjetphotobatch(inputFilename, tailNumCol, () => {
      let outputStatus = fs.readFileSync(outputStatusFilename, 'utf8')
      let outputPhotos = fs.readFileSync(outputPhotosFilename, 'utf8')
      expect(outputStatus).to.eql(outputStatusCSV)
      expect(outputPhotos).to.eql(outputPhotosCSV)
      done()
    })
  })

  it('names output CSVs based on input CSV')
})
