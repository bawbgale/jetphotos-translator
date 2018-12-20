const chai = require('chai')
const sinonChai = require('sinon-chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
chai.use(sinonChai)

const moxios = require('moxios')
const sandbox = require('sinon').createSandbox()
const fs = require('fs')

const retriever = require('../retriever.js')
const cacher = require('../cacher.js')

const mochaAsync = (fn) => {
  return done => {
    fn.call().then(done, err => {
      done(err)
    })
  }
}
const mockData = fs.readFileSync('test/data/results_page_with_photog.html')
const cachedPage = fs.readFileSync('test/data/cached_results_page_with_photog.html')

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
    expect(result.map(photoObj => photoObj.photo_url)).to.eql(expectedPhotos)
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

    expect(result.map(photoObj => photoObj.photo_url)).to.eql(expectedPhotos)
    expect(cacher.save).to.have.been.calledOnce()
    expect(cacher.save).to.have.been.calledWith(tailNum, mockData)
  }))

  it('optionally extracts from cache if page found there', mochaAsync(async () => {
    sandbox.stub(cacher, 'retrieve').returns([null, cachedPage])
    sandbox.stub(cacher, 'exists').returns(true)

    const tailNum = 'cachedTailNum'
    const expectedPhotos = ['cached_photo_url1', 'cached_photo_url2']

    const result = await retriever.getjetphotos(tailNum, true)

    expect(result.map(photoObj => photoObj.photo_url)).to.eql(expectedPhotos)
    expect(cacher.exists).to.have.been.calledOnce()
    expect(cacher.exists).to.have.been.calledWith(tailNum)
    expect(cacher.retrieve).to.have.been.calledOnce()
    expect(cacher.retrieve).to.have.been.calledWith(tailNum)
  }))

  it('extracts photographer name from jetphotos', mochaAsync(async () => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      request.respondWith({ status: 200, response: mockData })
    })

    let tailNum = '1234'
    let expectedPhotos = [
      { photo_url: 'photo_url1', photog: 'Photographer Name 1' },
      { photo_url: 'photo_url2', photog: 'Photographer Name 2' }
    ]
    const result = await retriever.getjetphotos(tailNum)
    expect(result).to.eql(expectedPhotos)
  }))
})
