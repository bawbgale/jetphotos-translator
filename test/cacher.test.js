const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const fs = require('fs')
const mockfs = require('mock-fs')

const cacher = require('../cacher.js')

const mochaAsync = (fn) => {
  return done => {
    fn.call().then(done, err => {
      done(err)
    })
  }
}

const mockData = `<html> <body> Uncached page </body> </html>`
const cachedPage = `<html> <body> Cached page </body> </html>`

describe('cacher', () => {
  beforeEach(() => {
    mockfs({
      'cache': {
        'cachedTailNum.html': cachedPage
      }
    })
  })

  afterEach(() => {
    mockfs.restore()
  })

  describe('save', () => {
    it('saves page to cache', mochaAsync(async () => {
      let tailNum = 'uncachedTailNum'
      await cacher.save(tailNum, mockData)
      fs.readFile(`cache/${tailNum}.html`, 'utf8', (err, fileData) => {
        if (err) throw err
        expect(fileData).to.eql(mockData)
      })
    }))
  })

  describe('retrieve', () => {
    it('extracts page from cache if found', mochaAsync(async () => {
      let tailNum = 'cachedTailNum'
      let result = await cacher.retrieve(tailNum)
      expect(result).to.eql([null, cachedPage])
    }))

    it('returns error if page not cached', mochaAsync(async () => {
      let tailNum = 'uncachedTailNum'
      let result = await cacher.retrieve(tailNum)
      expect(result[0]).to.not.eql(null)
    }))
  })

  describe('exists', () => {
    it('returns true if page is cached', () => {
      let tailNum = 'cachedTailNum'
      let result = cacher.exists(tailNum)
      expect(result).to.be.true()
    })

    it('returns false if page is not cached', () => {
      let tailNum = 'uncachedTailNum'
      let result = cacher.exists(tailNum)
      expect(result).to.be.false()
    })
  })
})
