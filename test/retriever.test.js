const chai = require('chai')
const expect = chai.expect
const moxios = require('moxios')

const retriever = require('../retriever.js')

const mochaAsync = (fn) => {
  return done => {
    fn.call().then(done, err => {
      done(err)
    })
  }
}

describe('getjetphotos', () => {
  beforeEach(() => {
    moxios.install()
  })

  afterEach(() => {
    moxios.uninstall()
  })

  it('extracts photo URLs from jetphotos', mochaAsync(async () => {
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
    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      request.respondWith({ status: 200, response: mockData })
    })

    let tailNum = '1234'
    let expectedPhotos = ['photo_url1', 'photo_url2']
    const result = await retriever.getjetphotos(tailNum)
    expect(result).to.eql(expectedPhotos)
  }))
})
