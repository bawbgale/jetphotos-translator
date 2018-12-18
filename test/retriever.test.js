const chai = require('chai')
const expect = chai.expect
const moxios = require('moxios')
const fs = require('fs')
const mockfs = require('mock-fs')

const retriever = require('../retriever.js')

const mochaAsync = (fn) => {
  return done => {
    fn.call().then(done, err => {
      done(err)
    })
  }
}
let mockData = `
<html>
  <body>
    <div class="result__section result__section--photo-wrapper">
      <a href="/photo/photo_id1" class="result__photoLink">
        <img src="photo_url1" class="result__photo"/>
      </a>
    </div>
    <div class="result__section result__section--photo-wrapper">
      <a href="/photo/photo_id2" class="result__photoLink">
        <img src="photo_url2" class="result__photo"/>
      </a>
    </div>
  </body>
</html>
`
let cachedPage = `
<html>
  <body>
    <div class="result__section result__section--photo-wrapper">
      <a href="/photo/photo_id1" class="result__photoLink">
        <img src="cached_photo_url1" class="result__photo"/>
      </a>
    </div>
    <div class="result__section result__section--photo-wrapper">
      <a href="/photo/photo_id2" class="result__photoLink">
        <img src="cached_photo_url2" class="result__photo"/>
      </a>
    </div>
  </body>
</html>
`
describe('getjetphotos', () => {
  beforeEach(() => {
    moxios.install()
  })

  afterEach(() => {
    moxios.uninstall()
  })

  it('extracts photo URLs from jetphotos', mochaAsync(async () => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      request.respondWith({ status: 200, response: mockData })
    })

    let tailNum = '1234'
    let expectedPhotos = ['photo_url1', 'photo_url2']
    const result = await retriever.getjetphotos(tailNum)
    expect(result).to.eql(expectedPhotos)
  }))

  it('saves pages to cache', mochaAsync(async () => {
    mockfs({
      'cache': {
        'cachedTailNum.html': cachedPage
      }
    })

    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      request.respondWith({ status: 200, response: mockData })
    })

    let tailNum = 'uncachedTailNum'
    let expectedPhotos = ['photo_url1', 'photo_url2']
    let result = await retriever.getjetphotos(tailNum, true)
    expect(result).to.eql(expectedPhotos)
    fs.readFile(`cache/${tailNum}.html`, 'utf8', (err, fileData) => {
      if (err) throw err
      expect(fileData).to.eql(mockData)
    })
  }))

  it('extracts from cache if page found there', mochaAsync(async () => {

    mockfs({
      'cache': {
        'cachedTailNum.html': cachedPage
      }
    })

    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      request.respondWith({ status: 200, response: mockData })
    })

    let tailNum = 'cachedTailNum'
    let expectedPhotos = ['cached_photo_url1', 'cached_photo_url2']
    let result = await retriever.getjetphotos(tailNum, true)
    expect(result).to.eql(expectedPhotos)

    tailNum = 'uncachedTailNum'
    expectedPhotos = ['photo_url1', 'photo_url2']
    result = await retriever.getjetphotos(tailNum)
    expect(result).to.eql(expectedPhotos)

    mockfs.restore()
  }))
})
