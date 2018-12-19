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
    const expectedResponse = {
      headers: { 'Content-Type': 'text/html' },
      statusCode: 200,
      body: '<html><body><img style="max-width: 500px;" src="https:photo_url1"/></body></html>'
    }
    const callback = (err, response) => {
      expect(retriever.getjetphotos).to.have.been.calledOnce()
      expect(retriever.getjetphotos).to.have.been.calledWith(tailNum)
      expect(err).to.be.null()
      expect(response).to.eql(expectedResponse)
    }

    let event

    beforeEach(() => {
      sandbox.stub(retriever, 'getjetphotos').resolves(['photo_url1', 'photo_url2'])
      event = {}
      event.queryStringParameters = {}
      event.body = ''
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('returns a web page with a photo of the aircraft with the given tail number (event prop)', mochaAsync(async () => {
      event.tailNum = tailNum
      await handler.getjetphoto(event, context, callback)
    }))

    it('returns a web page with a photo of the aircraft with the given tail number (query param)', mochaAsync(async () => {
      event.queryStringParameters.tailNum = tailNum
      await handler.getjetphoto(event, context, callback)
    }))

    it('returns a web page with a photo of the aircraft with the given tail number (post body)', mochaAsync(async () => {
      let body = {}
      body.tailNum = tailNum
      event.body = JSON.stringify(body)
      await handler.getjetphoto(event, context, callback)
    }))
  })

  describe('getjetphotoazure', () => {

  })
})
