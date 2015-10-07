'use strict'

import * as gooey from '../dist/core/index'

/**
 * Supported transaction methods in HTTP
 */
export const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD', 'LINK']

/**
 * Supported implementations of XHR
 */
export const xhrVersions = [for (i of [2,3,4,5]) `MSXML2.XmlHttp.${i}.0`].concat('Microsoft.XmlHttp')

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
    this.proxies = proxies

    methods.forEach(m => {
      const method = m.toLowerCase()

      this.constructor.prototype[method] = () => new HttpRequest(...arguments)
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
   * @returns {HttpRequest}
   */
  constructor({method: String, url: String, body?: Object, headers?: Object, type?: String}) {
    if (!methods.find(method => method === name))) {
      throw `Invalid request, unsupported method ${name}`
    }

    this._xhr = this.createXhr()
    
    this.url(url)
    this.method(method)
    this.headers(headers)
    this.body(body)
    this.type(type)
  }

  /**
   * Modifies a single request header
   * 
   * @param {String} field
   * @param {String} value
   * @returns {HttpRequest}
   */
  set header(field: String, value: String): HttpRequest {
    this._headers[field] = value
    this._xhr.setRequestHeader(field, value)
    return this
  }

  /**
   * Modifies request headers based on object
   * 
   * @param {Object} obj {field: value}
   * @returns {HttpRequest}
   */
  set headers(obj: Object): HttpRequest {
    Object.keys(obj).forEach(key => this.header(key, obj[key]))
    return this
  }

  /**
   * Sets request body
   * 
   * @param {Object} data
   * @returns {HttpRequest}
   */
  set body(data): HttpRequest {
    this.body = data
    return this
  }

  /**
   * Creates a native XHR object and sends request on resolve
   * 
   * @param {String} contentType
   * @returns {HttpRequest}
   */
  send(): HttpRequest {
    const xhr = this._xhr

    if (xhr) {
      xhr.open(this.method, url, true)

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
   * @param {Object} data
   * @param {String} mimeType
   * @returns {Object}
   */
  createXhr() {
    let xhr = null

    if (!Object.is(XMLHttpRequest, undefined)) {
      xhr = new XMLHttpRequest()
    } else {
      versions.forEach(version => {
        try {
          xhr = new ActiveXObject(version)
          break
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

  }

}
