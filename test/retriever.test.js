const chai = require('chai')
const expect = chai.expect
const moxios = require('moxios')

const retriever = require('../retriever.js')

describe('getjetphotos', () => {
  beforeEach(() => {
    moxios.install()
  })

  afterEach(() => {
    moxios.uninstall()
  })

  it('extracts photo URLs from jetphotos', (done) => {
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

    retriever.getjetphotos(tailNum, async (result) => {
      try {
        expect(result).to.eql(expectedPhotos)
        return done()
      } catch (e) {
        // workaround for Mocha throwing unhandledRejection instead of failing test
        return done(e)
      }
    })
  })
})
