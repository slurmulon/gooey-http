'use strict'

import * as http  from '../lib/http'
import * as gooey from 'gooey-core'

/**
 * Represents a single Restful API resource
 * Supports both singleton and collection resource entities
 */
export class Resource extends http.Http {

  /**
   * @param {string} name unique name mapping to a Rest API resource
   * @param {Function} model a container for business logic that's parallel to a Rest API resource
   * @param {string} base optional base URL of the API (primarily for root/high-level services)
   * @param {Service} [parent] service that this resource inherits data and/or state from
   * @param {Service} [children] services that are dependent upon this resource's data and/or state
   * @param {Service} [pattern] JsonPath pattern that's used to automatically subscribe service to a parent resource's sub-state
   */
  constructor(base: string, slug: string, collection: Boolean = true) {
    super(base) // TODO

    this.base = base
    this.slug = slug
    this.collection = collection
  }

  /**
   * Copies resource and turns it into a singleton
   *
   * @param id {string} id identifier of resource entity
   * @returns {Resource}
   */
  one(id: string): Resource {
    const resource = this.copy()

    resource.slug = id
    resource.collection = false

    return resource
  }

  /**
   * Copies resource and turns it into a collection
   *
   * @param id {string} id identifier of resource entity
   * @returns {Resource}
   */
  all(): Resource {
    const resource = this.copy()

    resource.slug = id
    resource.collection = true

    return resource
  }

  /**
   * Creates an copy of this resource in its current state
   *
   * @returns {Resource}
   */
  copy(): Resource {
    return new Resource(this.base, this.slug, this.collection)
  }

}

/**
 * Wraps a Restful API entity resource's state.
 * Messages updates to related resource entities via PubSub
 * in order to synchronize states and sub-states.
 */
export class Service extends gooey.Service {

  /**
   * @param {string} name unique name mapping to a Rest API resource
   * @param {string} [base] optional base URL of the API (primarily for root/high-level services)
   * @param {*} state value to use as the canonical state of the Service
   * @param {Function} model a container for business logic that's parallel to a Rest API resource
   * @param {Service} parent service that this resource inherits data and/or state from
   * @param {string|Function} [rel] pattern that describe's relationship to parent. Also used to automatically subscribe service to a parent resource's sub-state
   */
  constructor(name: string, base?: string, state, model: Function, parent?: Service, rel?: Function) {
    super(name, state, model, parent)

    this.resource = new Resource(base, name, model) // TODO - base
    this.selected = {entity: null}

    const relation = rel instanceof Function ? rel(super.state) : rel

    // when a parent and relationship pattern generator (rel) are provided, create a subscription
    // to the parent with and invoke pattern generator with current state
    if (parent) {
      this.subscribe(relation || `$.${name}`, this.update)
    }

    // bind versions of each HTTP method that update (and thus publish) results
    http.methods.forEach(m => {
      const method = m.toLowerCase()
      const resId  = this.selected.entity
      const resUrl = resId ? `${base}/${resId}/${name}` : `${base}/${name}`

      this[method] = () => {
        this.resource[method](absUrl, ...arguments)
            .finally(response => this.update(response))
      }
    })
  }

  /**
   * Creates a Service representing the state of a specific API resource entity
   * Promise resolved is triggered whenever the relevant resource entity's
   *
   * @param {string} id identifier ot API resource entity
   * @returns {Promise} resolves with a new resource based on entity state in API
   */
  by(id: string): Promise {
    return this.resource.one(id).get()
  }

  /**
   * Creates a Service representing the state of a collection of API resource entities (e.g. users, quotes, etc.)
   * Promise resolved is triggered whenever the relevant resource entity's state is updated locally
   *
   * @returns {Promise} resolves with a new resource based on collection entity state in API
   */
  all(): Promise {
    return this.resource.all().get()
  }

  /**
   * Creates a Service representing an organic user's currently selected API resource entity (based on `by`)
   * Promise resolved is triggered whenever the relevant resource entity's state is updated locally
   *
   * @returns {Promise} resolves with a new singleton entity resource based on user's selection if it exists
   */
  current(): Promise {
    const entityId = this.selected.entity

    return entityId ? this.resource.by(entityId) : Promise.resolve(null)
  }

  /**
   * Switches context of Service to a new singleton resource entity, establishing a new `current`
   *
   * @returns {Promise} resolves with a new singleton entity resource based on user's selection if it exists
   */
  select(id: string): Promise {
    this.selected.entity = id

    return this.current()
  }
}

/**
 * POJO-style alias of Service
 */
export const service = ({ name, state, model, base, parent, children, rel }) => new Service(name, base, state, model, parent, children, rel)
