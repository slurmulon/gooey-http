'use strict'

import * as gooey from '../dist/core/index'

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
 * Chainable interface that integrates HttpRequest and HttpResponse
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

      this.constructor.prototype[method] = () => new HttpRequest(method, ...arguments)
    })
  }

}

/**
 * Deferred and chainable XHR-based HTTP request
 */
export class HttpRequest extends Promise {

  /**
   * Creates a native XHR object and sends request on resolve
   * 
   * @param {String} method
   * @param {String} url
   * @param {?Object} body
   * @param {?Object} headers
   * @param {?String} type
   * @param {?String} charset
   * @returns {HttpRequest}
   */
  constructor(method: String, url: String, body?: Object, headers?: Object, type?: String, charset?: String) {
    super((resolve, reject) => {
      if (methods.find(method => method === name)) {
        resolve(this)
      } else {
        reject(`Invalid request, valid method and url required: ${url} | ${method}`)
      }
    })

    this._xhr = this.createXhr()
    
    this.url(url)
    this.method(method)
    this.headers(headers)
    this.body(body)
    this.type(type)
    this.charset(charset)
  }

  /**
   * Modifies request URL
   * 
   * @param {String} url
   * @returns {HttpRequest}
   */
  set url(url: String): HttpRequest {
    this._url = url
    return this
  }

  /**
   * Modifies request method (GET, POST, PUT, etc)
   * 
   * @param {String} method
   * @returns {HttpRequest}
   */
  set method(method: String): HttpRequest {
    this._method = method
    return this
  }

  /**
   * Sets request body
   * 
   * @param {Object} data
   * @returns {HttpRequest}
   */
  set body(data): HttpRequest {
    this._body = data
    return this
  }

  /**
   * Modifies a single request header
   * 
   * @param {Object} header {field: value}
   * @returns {HttpRequest}
   */
  set header(header: Object): HttpRequest {
    const {field, value} = header
    this._headers[field] = value
    this._xhr.setRequestHeader(field, value)
    return this
  }

  /**
   * Modifies request headers based on object
   * 
   * @param {Object} headers {field: value}
   * @returns {HttpRequest}
   */
  set headers(headers: Object): HttpRequest {
    Object.keys(headers).forEach(field => this.header({field, value: obj[key]}))
    return this
  }

  /**
   * Sets request content type
   * 
   * @param {String} type
   * @param {String} charset
   * @returns {HttpRequest}
   */
  set type(type: String = 'application/text'): HttpRequest {
    this._body = data
    this.header({field: 'Content-Type', value: `${type}; charset=${this._charset}`})
    return this
  }

  /**
   * Sets request character set
   * 
   * @param {String} charset
   * @returns {HttpRequest}
   */
  set charset(charset: String = 'UTF-8'): HttpRequest {
    this._charset = charset
    return this
  }

  /**
   * Creates a native XHR object and sends request on resolve
   * 
   * @returns {HttpRequest}
   */
  send(): HttpRequest {
    const xhr = this._xhr

    if (xhr) {
      xhr.open(this.method, url, true)

      // TODO - remaining xhr.events

      xhr.onload = () => {
        const body = this.mimeify(xhr.responseText, this.type)

        if (xhr.status >= 200 && xhr.status < 400) {
          super.resolve(body)
        } else {
          super.reject(body)
        }
      }

      xhr.onerror = (e) => super.reject(e)

      Object.keys(headers).forEach(key => {
        request.setRequestHeader(key, this.headers[key])
      })
      
      xhr.send(this.body)
    } else {
      super.reject(`Cannot perform XHR, failed to determine compatible version`)
    }

    return this
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
          xhr = xhr || new ActiveXObject(version)
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
  mimeify(data, mimeType: String = 'application/text') {
    return {
      'application/json': JSON.parse(data),
    }[mimeType] || data
  }

}

/**
 * Deferred and chainable XHR-based HTTP response
 */
export class HttpResponse extends Promise {
  
  constructor(request: HttpRequest) {
    super() // TODO
  }

}
