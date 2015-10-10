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

    it('should bind own functions for each HTTP method', () => {
      const testHttp = new http.Http()

      http.methods.forEach(method => {
        const methodProp = method.toLowerCase()

        testHttp.should.have.ownProperty(methodProp)
        testHttp[methodProp].should.be.a('function')
      })
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
      const expHeaders  = {'Content-Type': 'application/text; charset=UTF-8'}

      stubRequest
        .headers(testHeaders)
        .send()

      stubRequest._headers.should.deep.equals(Object.assign(expHeaders, testHeaders))
    })

    it('should bind URL encoded query parameters before sending request', () => {
      const testHeaders   = {a: 1, b: 2}
      const urlEncHeaders = '?a=1&b=2'

      stubRequest
        .query(testHeaders)
        .send()

      stubRequest._query.should.deep.equals(urlEncHeaders)
    })

    it('should set provided Content-Type before sending', () => {
      const testType = 'application/json'
      const expType  = `${testType}; charset=UTF-8`

      stubRequest
        .type(testType)
        .send()

        stubRequest._type.should.equal(testType)
        stubRequest._headers.should.have.property('Content-Type')
        stubRequest._headers['Content-Type'].should.equal(expType)
    })

    it('should set default Content-Type before sending if nothing can be assumed', () => {
      const expType = 'application/text'

      stubRequest._type.should.equal(expType)
      stubRequest._headers['Content-Type'].should.contain(expType)
      stubRequest.send()
    })

    xit('should safely assume and set Content-Type based on body before sending', () => {
      // TODO
    })

    it('should send request with the provided body if an XHR object exists', () => {
      const xhrSpy   = chai.spy(stubRequest.createXhr())
      const testBody = {foo: 'bar', 'baz': {bar: 'foo'}}

      stubRequest
        .body(testBody)
        .send(xhrSpy)
        .then(() => {
          xhrSpy.open.should.have.been.called.with
          xhrSpy.send.should.have.been.called.with(testBody)
        })
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

  // URL

  describe('get _url', () => {
    it('should be a defined getter', () => {
      stubRequest._url.should.be.a('string')
    })

    it('should return the internal property `__url`', () => {
      stubRequest._url.should.equal(stubRequest.__url)
    })
  })

  describe('set _url', () => {
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

  describe('url', () => {
    it('should be a chainable alias to `set _url`', () => {
      const testUrl = 'http://127.1.1.1'

      expect(stubRequest.url(testUrl)).to.eql(stubRequest)
      stubRequest._url.should.equal(testUrl)
    })
  })

  // Method

  describe('get method', () => {
    it('should be a defined getter', () => {
      stubRequest._method.should.be.a('string')
    })

    it('should return the internal property `__method`', () => {
      stubRequest._method.should.equal(stubRequest.__method)
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

  describe('method', () => {
    it('should be a chainable alias to `set _method`', () => {
      const testMethod = 'POST'

      expect(stubRequest.method(testMethod)).to.eql(stubRequest)
      stubRequest._method.should.equal(testMethod)
    })
  })

  // Body

  describe('get _body', () => {
    it('should be a defined getter', () => {
      stubRequest._body = {}
      stubRequest._body.should.be.a('object')
    })

    it('should be a defined getter', () => {
      stubRequest._body = {}
      stubRequest._body.should.be.a('object')
    })

    it('should return the internal property `__body`', () => {
      stubRequest._body = {}
      stubRequest._body.should.equal(stubRequest.__body)
    })
  })

  describe('set _body', () => {
    it('should update the internal property __body', () => {
      stubRequest._body = {foo: 'bar'}
      stubRequest._body.should.equal(stubRequest.__body)
    })
  })

  describe('body', () => {
    it('should be a chainable alias to `set _body`', () => {
      const testBody = {foo: 'bar'}

      expect(stubRequest.body(testBody)).to.eql(stubRequest)
      stubRequest._body.should.equal(testBody)
    })
  })

  // Headers

  describe('get _headers', () => {
    it('should be a defined getter', () => {
      stubRequest._headers.should.be.a('object')
    })

    it('should be a defined getter', () => {
      stubRequest._headers.should.be.a('object')
    })
  })

  xdescribe('set _headers', () => {

  })

  // Content-Type

  describe('get _type', () => {
    it('should be a defined getter', () => {
      stubRequest._type.should.be.a('string')
    })
  })

  xdescribe('set _type', () => {

  })

  // Character Set

  xdescribe('get _charset', () => {
    it('should be a defined getter', () => {
      stubRequest._charset.should.be.a('string')
    })
  })

  xdescribe('set _charset', () => {

  })

  // Utility

  xdescribe('mimeify', () => {
    it('should be a defined method', () => {

    })
  })

  xdescribe('get simple', () => {
    it('should be a defined method', () => {

    })
  })
})
