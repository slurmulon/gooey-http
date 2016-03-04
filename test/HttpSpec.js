import * as http from '../lib/http'
import XMLHttpRequest from 'xhr2'

import chai from 'chai'
import chaiSpies from 'chai-spies'
import blanket from 'blanket'

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

      stubRequest
        .headers(testHeaders)
        .send()

      stubRequest.__headers.should.deep.equals(testHeaders)
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
      const expType = 'application/json'

      stubRequest._type.should.equal(expType)
      stubRequest._headers['Content-Type'].should.contain(expType)
      stubRequest.send()
    })

    it('should send request with the provided body if an XHR object exists', () => {
      const xhrSpy   = chai.spy(stubRequest.createXhr())
      const testBody = {foo: 'bar', 'baz': {bar: 'foo'}}

      stubRequest
        .body(testBody)
        .send(xhrSpy)
        .then(() => {
          xhrSpy.open.should.have.been.called
          xhrSpy.send.should.have.been.called.with(testBody)
        })
        .should.be.fulfilled
    })

    it('should reject request if no internal XHR object exists', () => {
      stubRequest.send(null).should.be.rejected
    })
  })

  describe('createXhr', () => {
    it('should be a defined method', () => {
      stubRequest.createXhr.should.be.a('function')
    })

    it('should return an instance of XMLHttpRequest if it exists', () => {
      stubRequest.createXhr().should.be.instanceof(XMLHttpRequest)
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

    it('should update the internal property `__url`', () => {
      stubRequest._url = 'http://127.1.1.1'
      stubRequest._url.should.equal(stubRequest.__url)
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

    it('should return the internal property `__body`', () => {
      stubRequest.__body = {}
      stubRequest._body.should.equal(stubRequest.__body)
    })
  })

  describe('set _body', () => {
    it('should update the internal property `__body`', () => {
      stubRequest._body = {}
      stubRequest._body.should.equal(stubRequest.__body)
    })

    it('should also set `_type` to "application/json" if body is an Object', () => {
      stubRequest._body = {}
      stubRequest._type.should.equal('application/json')
    })

    it('should also set `_type` to "application/text" if body is a String', () => {
      stubRequest._body = 'foo'
      stubRequest._type.should.equal('text/plain')
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
      stubRequest._headers.should.be.an('object')
    })

    it('should return the internal property `__headers`', () => {
      stubRequest.__headers = {'X-Field': 'Value'}
      stubRequest._headers.should.contain(stubRequest.__headers)
    })

    it('should return headers with a `Content-Type` field if a one is defined', () => {
      const testHeaders = {'X-Field': 'Value'}

      stubRequest._type = 'text/plain'
      stubRequest._headers = testHeaders
      stubRequest._headers.should.deep.equal(Object.assign({'Content-Type': 'text/plain; charset=UTF-8'}, testHeaders))
    })
  })

  describe('set _headers', () => {
    it('should be a setter that replaces the value of __headers', () => {
      stubRequest.__type = undefined // so content-type headers don't appear
      stubRequest._headers = {'X-Field': 'Value'}
      stubRequest._headers.should.equal(stubRequest.__headers)
    })
  })

  // Query Params

  // Form

  describe('form', () => {
    it('should be a defined method', () => {
      stubRequest.form.should.be.an('function')
    })

    xit('should accept an Object and convert it into a "form" via query params', () => {
      stubRequest.form({foo: 'bar', baz: 'foo'})
      stubRequest._body = '?foo=bar&baz=foo'
      stubRequest._headers.should.deep.contain({'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'})
    })

    it('should be chainable', () => {
      expect(stubRequest.form()).to.eql(stubRequest)
    })
  })

  // Content-Type

  describe('get _type', () => {
    it('should be a defined getter', () => {
      stubRequest._type.should.be.a('string')
    })

    it('should return the internal property `__type`', () => {
      stubRequest.__type = 'ASCII'
      stubRequest._type.should.equal(stubRequest.__type)
    })
  })

  describe('set _type', () => {
    it('should be a setter that replaces the value of __type', () => {
      stubRequest._type = 'application/json'
      stubRequest._type.should.equal(stubRequest.__type)
    })

    it('should be a setter that uses `application/json` by default', () => {
      stubRequest._type = undefined
      stubRequest._type.should.equal('application/json')
    })
  })

  describe('type', () => {
    it('should be a chainable alias to `set _type`', () => {
      const testType = 'ASCII'
      const typeRes  = stubRequest.type(testType)

      expect(typeRes).to.eql(stubRequest)
      stubRequest._type.should.equal(testType)
    })
  })

  // Character Set

  describe('get _charset', () => {
    it('should be a defined getter', () => {
      stubRequest._charset.should.be.a('string')
    })

    it('should return the internal property `__charset`', () => {
      stubRequest.__charset = 'ASCII'
      stubRequest._charset.should.contain(stubRequest.__charset)
    })
  })

  describe('set _charset', () => {
    it('should be a setter that replaces the value of __charset', () => {
      stubRequest._charset = 'ASCII'
      stubRequest._charset.should.equal(stubRequest.__charset)
    })

    it('should be a setter that uses `UTF-8` by default', () => {
      stubRequest._charset = undefined
      stubRequest._charset.should.equal('UTF-8')
    })
  })

  describe('charset', () => {
    it('should be a chainable alias to `set _charset`', () => {
      const testCharset = 'UTF-8'

      expect(stubRequest.charset(testCharset)).to.eql(stubRequest)
      stubRequest._charset.should.equal(testCharset)
    })
  })

  // Utility

  describe('mimeify', () => {
    it('should be a defined method', () => {
      stubRequest.mimeify.should.be.a('function')
    })

    xit('should properly marshall data based on its mimeType')
  })

  describe('get simple', () => {
    it('should be a defined method', () => {
      stubRequest.simple.should.be.a('function')
    })

    it('should contain functions for method, body, query, type, headers and charset', () => {
      const simple = stubRequest.simple()
      const funcs  = ['body', 'headers', 'query', 'type', 'charset']

      funcs.forEach(f => {
        simple.should.have.ownProperty(f)
        simple[f].should.be.a('function')
      })
    })

  })
})
