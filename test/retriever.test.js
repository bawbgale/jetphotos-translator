const chai = require('chai')
const expect = chai.expect
const moxios = require('moxios')
const sandbox = require('sinon').createSandbox()

const retriever = require('../retriever.js')
const cacher = require('../cacher.js')

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
    sandbox.restore()
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

  it('optionally saves pages to cache', mochaAsync(async () => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      request.respondWith({ status: 200, response: mockData })
    })
    sandbox.stub(cacher, 'save')
    const tailNum = 'uncachedTailNum'
    const expectedPhotos = ['photo_url1', 'photo_url2']

    const result = await retriever.getjetphotos(tailNum, true)

    expect(result).to.eql(expectedPhotos)
    sandbox.assert.calledOnce(cacher.save)
    sandbox.assert.calledWith(cacher.save, tailNum, mockData)
  }))

  it('optionally extracts from cache if page found there', mochaAsync(async () => {
    sandbox.stub(cacher, 'retrieve').returns([null, cachedPage])
    sandbox.stub(cacher, 'exists').returns(true)

    const tailNum = 'cachedTailNum'
    const expectedPhotos = ['cached_photo_url1', 'cached_photo_url2']

    const result = await retriever.getjetphotos(tailNum, true)

    expect(result).to.eql(expectedPhotos)
    sandbox.assert.calledOnce(cacher.exists)
    sandbox.assert.calledWith(cacher.exists, tailNum)
    sandbox.assert.calledOnce(cacher.retrieve)
    sandbox.assert.calledWith(cacher.retrieve, tailNum)
  }))
})
