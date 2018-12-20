const chai = require('chai')
const sinonChai = require('sinon-chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(sinonChai)
chai.use(dirtyChai)

const sandbox = require('sinon').createSandbox()
const handler = require('../handler.js')
const retriever = require('../retriever.js')

const mochaAsync = (fn) => {
  return done => {
    fn.call().then(done, err => {
      done(err)
    })
  }
}

describe('handler', () => {
  describe('getjetphoto', () => {
    const context = {}
    const tailNum = '1234'
    let expectedResponse = {
      headers: { 'Content-Type': 'text/html' },
      statusCode: 200,
      body: '<html><body><img style="max-width: 500px;" src="https:photo_url1"/></body></html>'
    }
    let callback = (err, response) => {
      expect(retriever.getjetphotos).to.have.been.calledOnce()
      expect(retriever.getjetphotos).to.have.been.calledWith(tailNum)
      expect(err).to.be.null()
      expect(response).to.eql(expectedResponse)
    }
    let mockRetrieverResponse = [
      { photo_url: 'photo_url1', photog: 'Photographer Name 1' },
      { photo_url: 'photo_url2', photog: 'Photographer Name 2' }
    ]
    let event

    beforeEach(() => {
      event = {}
      event.queryStringParameters = {}
      event.body = '{}'
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('returns a web page with a photo of the aircraft with the given tail number (event prop)', mochaAsync(async () => {
      event.tailNum = tailNum
      sandbox.stub(retriever, 'getjetphotos').resolves(mockRetrieverResponse)
      await handler.getjetphoto(event, context, callback)
    }))

    it('returns a web page with a photo of the aircraft with the given tail number (query param)', mochaAsync(async () => {
      event.queryStringParameters.tailNum = tailNum
      sandbox.stub(retriever, 'getjetphotos').resolves(mockRetrieverResponse)
      await handler.getjetphoto(event, context, callback)
    }))

    it('returns a web page with a photo of the aircraft with the given tail number (post body)', mochaAsync(async () => {
      let body = {}
      body.tailNum = tailNum
      event.body = JSON.stringify(body)
      sandbox.stub(retriever, 'getjetphotos').resolves(mockRetrieverResponse)
      await handler.getjetphoto(event, context, callback)
    }))

    it('returns error if no tailNum', mochaAsync(async () => {
      event.tailNum = ''
      expectedResponse = {
        headers: { 'Content-Type': 'text/html' },
        statusCode: 400,
        body: 'Please pass a tail number on the query string or in the request body'
      }
      sandbox.stub(retriever, 'getjetphotos')
      await handler.getjetphoto(event, context, (err, response) => {
        expect(retriever.getjetphotos).to.have.not.been.called()
        expect(err).to.be.null()
        expect(response).to.eql(expectedResponse)
      })
    }))

    it('returns error if retriever error received', mochaAsync(async () => {
      event.tailNum = '1234'
      sandbox.stub(retriever, 'getjetphotos').resolves('[500] Some error happened')
      expectedResponse = {
        headers: { 'Content-Type': 'text/html' },
        statusCode: 500,
        body: '[500] Some error happened'
      }
      await handler.getjetphoto(event, context, callback)
    }))

    it('returns no photos message if no photos retrieved', mochaAsync(async () => {
      event.tailNum = '1234'
      sandbox.stub(retriever, 'getjetphotos').resolves([])
      expectedResponse = {
        headers: { 'Content-Type': 'text/html' },
        statusCode: 204,
        body: '<html><body>No photos :-(</body></html>'
      }
      await handler.getjetphoto(event, context, callback)
    }))
  })

  describe('getjetphotoazure', () => {

  })
})
