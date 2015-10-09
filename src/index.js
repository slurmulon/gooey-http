'use strict'

import * as gooey from '../node_modules/gooey/dist/index'
import XMLHttpRequest from 'xhr2'

/**
 * URL regex pattern
 */
export const urlExp = /\(?(?:(http|https|ftp):\/\/)?(?:((?:[^\W\s]|\.|-|[:]{1})+)@{1})?((?:www.)?(?:[^\W\s]|\.|-)+[\.][^\W\s]{2,4}|localhost(?=\/)|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::(\d*))?([\/]?[^\s\?]*[\/]{1})*(?:\/?([^\s\n\?\[\]\{\}\#]*(?:(?=\.)){1}|[^\s\n\?\[\]\{\}\.\#]*)?([\.]{1}[^\s\?\#]*)?)?(?:\?{1}([^\s\n\#\[\]]*))?([\#][^\s\n]*)?\)?/

/**
 * Supported transaction methods in HTTP
 */
export const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD', 'LINK']

/**
 * Meta-information on XHR interface
 */
export const xhr = {
  versions : [2,3,4,5].map(v => `MSXML2.XmlHttp.${v}.0`).concat('Microsoft.XmlHttp'),
  events   : ['onloadstart', 'onprogress', 'onabort', 'onerror', 'onload', 'ontimeout', 'onloadend']
}

/**
 * Chainable interface that integrates Request and HttpResponse
 *
 * TODO - handle gooey.Service params
 */
export class Http extends gooey.Service {

  /**
   * @param {Object} proxies request / response middlewares
   */
  constructor(proxies?: Object = {}) {
    super() // TODO

    this.proxies = proxies

    methods.forEach(m => {
      const method = m.toLowerCase()

      this.constructor.prototype[method] = () => new Request(method, ...arguments)
    })
  }

}

/**
 * Deferred and chainable XHR-based HTTP request
 *
 * Should eventually extend Promise once babel supports this properly:
 * https://github.com/babel/babel/issues/1120
 */
export class Request {

  /**
   * Creates a native XHR object and sends request on resolve
   * 
   * @param {String}  method
   * @param {String}  url
   * @param {?Object} body
   * @param {?Object} headers
   * @param {?String} query
   * @param {?String} type
   * @param {?String} charset
   * @returns {Request}
   */
  constructor(method: String, url: String, body?: Object, headers?: Object, query?: String, type?: String, charset?: String) {
    this._xhr = this.createXhr()
    this._url = url
    this._method = method

    if (this._url && this._method) {
      this.open()
    }
  }

  open() {
    if (!this._url || !this._method) {
      throw `Invalid request, valid method and url required: ${this._url} | ${this._method}`
    }

    this._xhr.open(this._method, this._url, true)

    return this
  }

  /**
   * Fetches request URL
   * 
   * @returns {String}
   */
  get _url(): String {
    return this.__url
  }

  /**
   * Modifies request URL
   * 
   * @param {String} url
   */
  set _url(url: String) {
    if (urlExp.test(url)) {
      this.__url = url
    }
  }

  /**
   * Modifies request URL
   * Chainable alias of `_url`
   * 
   * @param {String} url
   * @returns {Request}
   */
  url(url: String): Request {
    this._url = url
    return this
  }

  /**
   * Fetches request method
   * 
   * @returns {String}
   */
  get _method(): String {
    return this.__method
  }

  /**
   * Modifies request method (GET, POST, PUT, etc)
   * 
   * @param {String} method
   */
  set _method(method: String): String {
    if (methods.find(m => m === method)) {
      this.__method = method
    }
  }

  /**
   * Modifies request method (GET, POST, PUT, etc)
   * Chainable alias of `_method`
   * 
   * @param {String} method
   * @returns {Request}
   */
  method(method: String): Request {
    this._method = method
    return this
  }

  /**
   * Fetches request body
   * 
   * @returns {String}
   */
  get _body(): String {
    return this.__body
  }

  /**
   * Sets request body
   * 
   * @param {Object} body
   */
  set _body(body) {
    this.__body = body
  }

  /**
   * Sets request body
   * Chainable alias of `_body`
   * 
   * @param {Object} body
   * @returns {Request}
   */
  body(body): Request {
    this._body = body
    return this
  }

  /**
   * Fetches request headers
   * 
   * @returns {String}
   */
  get _headers(): String {
    return this.__headers
  }

  /**
   * Modifies request headers
   * 
   * @param {Object} headers {field: value}
   */
  set _headers(headers: Object) {
    Object.keys(headers).forEach(field => this.header({field, value: headers[field]}))
  }

  /**
   * Modifies request header and bind to XHR object
   * Chainable
   * 
   * @param {Object} headers {field: value}
   * @returns {Request}
   */
  header(header: Object): Request {
    const {field, value}  = header
    this.__headers = this.__headers || {}
    this.__headers[field] = value
    this._xhr.setRequestHeader(field, value)
    return this
  }

  /**
   * Modifies request headers
   * Chainable alias of `_headers`
   * 
   * @param {Object} headers {field: value}
   * @returns {Request}
   */
  headers(headers: Object): Request {
    this._headers = headers
    return this
  }

  /**
   * Fetches request query parameters
   * 
   * @returns {String}
   */
  get _query(): String {
    return this.__query
  }

  /**
   * Modifies and encodes query parameters based on object
   * 
   * @param {Object} headers {field: value}
   * @returns {Request}
   */
  set _query(params: Object) {
    let encodedParams = '?'

    Object.keys(params).forEach(key => {
      encodedParams += (encodedParams !== '?' ? '&' : '') + encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
    })

    this.__query = encodedParams
  }

  /**
   * Modifies request URL query parameters based on object
   * Chainable alias of `_query`
   * 
   * @param {Object} headers {field: value}
   * @returns {Request}
   */
  query(params: Object): Request {
    this._query = params
    return this
  }

  /**
   * Fetches request content type
   * 
   * @returns {String}
   */
  get _type(): String {
    return this.__type
  }

  /**
   * Sets request content type
   * 
   * @param {String} type
   */
  set _type(type: String = 'application/text') {
    this.__type = type
    this.header({field: 'Content-Type', value: `${type}; charset=${this._charset}`})
  }

  /**
   * Sets request content type
   * Chainable alias of `_type`
   * 
   * @param {String} type
   * @returns {Request}
   */
  type(type: String = 'application/text'): Request {
    this._type = type
    return this
  }

  /**
   * Fetches request character set
   * 
   * @returns {String}
   */
  get _charset(): String {
    return this.__charset || 'UTF-8'
  }

  /**
   * Sets request character set
   * 
   * @param {String} charset
   */
  set _charset(charset: String = 'UTF-8') {
    // TODO - validate for proper charsets
    this.__charset = charset
  }

  /**
   * Sets request character set (chainable)
   * 
   * @param {String} charset
   * @returns {Request}
   */
  charset(charset: String): Request {
    this._charset = charset
    return this
  }

  /**
   * Creates a native XHR object and sends request on resolve
   * 
   * @returns {Promise}
   */
  send(): Promise {
    return new Promise((resolve, reject) => {
      const xhr = this._xhr
      let uri   = this._url

      if (xhr) {
        if (!xhr.OPEN) {
          this.open()
        }

        xhr.onload = () => {
          const response = ('response' in xhr) ? xhr.response : xhr.responseText;

          if (xhr.status >= 200 && xhr.status < 400) {
            this._response = {success: response}
            resolve(response)
          } else {
            this._response = {error: response}
            reject(response)
          }
        }

        xhr.onerror = (e) => reject(e)

        // TODO - support remaining xhr.events
        // TODO - automatically make content-type application/json when object

        // ship it
        xhr.send(this._body)
      } else {
        reject(`Cannot perform XHR, failed to determine compatible version`)
      }
    })
  }

  // set attach()

  /**
   * Builds a native XHR object based on the browser version
   * 
   * @returns {Object} native XHR object
   */
  createXhr(): Object {
    let xhr = null

    if (!Object.is(XMLHttpRequest, undefined)) {
      xhr = new XMLHttpRequest()
    } else {
      versions.forEach(version => { // TODO - optimize
        try {
          if (!xhr) xhr = new ActiveXObject(version)
        } catch (e) {}
      })
    }

    return xhr
  }

  /**
   * Marshalls data into mimeType
   * 
   * @param {Object} data
   * @param {String} mimeType
   * @returns {Object}
   */
  mimeify(data, mimeType: String = 'application/text'): Object {
    return {
      'application/json': JSON.parse(data),
    }[mimeType] || data
  }

  /**
   * Marshalls request from a promise into a simple POJO
   * of request-specific properties
   * 
   * @param {Object} data
   * @param {String} mimeType
   * @returns {Object}
   */
  get simple(): Object {
    const simple = {}
    const keys = Object.keys(this).find(k => k[0] === '_')

    keys.forEach(k => {
      simple[k.replace('_', '')] = this[k]
    })

    return simple
  }

}

/**
 * Deferred and chainable XHR-based HTTP response
 */
export class Response {
  
  constructor(request: Request) {

  }

}
