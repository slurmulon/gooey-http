import * as http from '../dist/index'
import chai from 'chai'
import chaiSpies from 'chai-spies'

chai.use(chaiSpies)

const should = chai.should()
const expect = chai.expect

describe('Http', () => {

  describe('constructor', () => {
    it('should be a defined method', () => {
      http.Http.constructor.should.be.a('function')
    })
  })

})

describe('Request', () => {

  let stubRequest

  beforeEach(() => {
    stubRequest = new http.Request('GET', 'http://127.0.0.1')
  })

  describe('constructor', () => {
    it('should be a defined method', () => {
      http.Request.constructor.should.be.a('function')
    })

    it('should set url and method if provided', () => {
      stubRequest._url.should.equal('http://127.0.0.1')
      stubRequest._method.should.equal('GET')
    })

  })

  describe('send', () => {
    it('should be a defined method', () => {
      stubRequest.send.should.be.a('function')
    })

    it('should return a Promise', () => {
      stubRequest.send().should.be.a('promise')
    })

    it('should bind headers before sending request', () => {
      const testHeaders = {'X-Test-1': 'foo', 'X-Test-2': 'bar'}

      stubRequest
        .headers(testHeaders)
        .send()

      stubRequest._headers.should.deep.equals(testHeaders)
    })

    it('should bind URL encoded query parameters before sending request', () => {
      const testHeaders   = {a: 1, b: 2}
      const urlEncHeaders = '?a=1&b=2'

      stubRequest
        .query(testHeaders)
        .send()

      stubRequest._query.should.deep.equals(urlEncHeaders)
    })

    it('should set Content-Type before sending', () => {
      const testType = 'application/json'
      const expType  = `${testType}; charset=UTF-8`

      stubRequest
        .type(testType)
        .send()

        stubRequest._type.should.equal(testType)
        stubRequest._headers.should.have.property('Content-Type')
        stubRequest._headers['Content-Type'].should.equal(expType)
    })

    it('should send request with the provided body if an XHR object exists', () => {
      const xhrSpy   = chai.spy(stubRequest.createXhr())
      const testBody = {foo: 'bar', 'baz': {bar: 'foo'}}

      stubRequest
        .body(testBody)
        .send(xhrSpy)
        .then(() => xhrSpy.should.have.been.called.with(testBody))
        .should.not.be.rejected
    })

    it('should reject request if no XHR object exists', () => {
      stubRequest.__xhr = null

      stubRequest.send().should.be.rejected
    })
  })

  describe('createXhr', () => {
    it('should be a defined method', () => {
      stubRequest.createXhr.should.be.a('function')
    })

    xit('should return a native XHR object based on browser version', () => {

    })
  })

  describe('get url', () => {
    it('should be a defined getter', () => {
      stubRequest._url.should.be.a('string')
    })

    it('should return the internal property __url', () => {
      stubRequest._url.should.equal(stubRequest.__url)
    })
  })

  describe('set url', () => {
    it('should be a setter that uses valid URLs', () => {
      stubRequest._url = 'http://127.1.1.1'
      stubRequest._url.should.equal('http://127.1.1.1')
    })

    it('should be a setter that ignores invalid URLs', () => {
      [undefined, null, '', 'a', 'http://', 'http://a'].forEach(invalid => {
        stubRequest._url = invalid
        stubRequest._url.should.not.equal(invalid)
      })
    })
  })

  describe('get method', () => {
    it('should be a defined getter', () => {
      stubRequest._method.should.be.a('string')
    })
  })

  describe('set _method', () => {
    it('should be a setter that uses valid HTTP method values', () => {
      http.methods.forEach(method => {
        stubRequest._method = method
        stubRequest._method.should.equal(method)
      })
    })

    it('should be a setter that ignores invalid HTTP method values', () => {
      [undefined, null, '', 'a', 'gets'].forEach(invalid => {
        stubRequest._method = invalid
        stubRequest._method.should.not.equal(invalid)
      })
    })
  })

  xdescribe('get body', () => {
    it('should be a defined method', () => {

    })
  })

  xdescribe('set body', () => {
    it('should be a defined method', () => {

    })
  })

  xdescribe('get header', () => {
    it('should be a defined method', () => {

    })
  })

  xdescribe('set headers', () => {
    it('should be a defined method', () => {

    })
  })

  xdescribe('get type', () => {
    it('should be a defined method', () => {

    })
  })

  xdescribe('set type', () => {
    it('should be a defined method', () => {

    })
  })

  xdescribe('get charset', () => {
    it('should be a defined method', () => {

    })
  })

  xdescribe('set charset', () => {
    it('should be a defined method', () => {

    })
  })

  xdescribe('mimeify', () => {
    it('should be a defined method', () => {

    })
  })

  xdescribe('get simple', () => {
    it('should be a defined method', () => {

    })
  })
})
