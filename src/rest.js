'use strict'

import * as http from '../dist/http'
import * as gooey from '../node_modules/gooey/dist/index'

export class Rest extends http.Http {

  constructor(slug: String, model: Function, collection: Boolean = true) {
    super() // TODO

    this.slug = slug
    this.collection = collection
  }

  one(id: String): RestResource {
    const resource = this.copy()

    resource._slug = id
    resource._collection = false

    return resource
  }

  all(): RestResource {
    const resource = this.copy()

    resource._slug = id
    resource._collection = true

    return resource
  }

  copy(): RestResource {
    return new RestResource(this.slug, this.model, this.collection)
  }

}

export class RestService extends gooey.Service {

  constructor(base: String, name: String, model: Function, parent: Service, children: Array) {
    super(...Array.from(arguments).slice())

    this.resource = new Rest(name, model)
    this.selected = {entity: null}

    // bind versions of each HTTP method that update (and thus publish) results
    http.methods.forEach(m => {
      const method = m.toLowerCase()
      const resId  = this.selected.entity
      const resUrl = resId ? `${baseUrl}/${resId}/${name}` : `${baseUrl}/${name}`

      this[method] = () => {
        this.resource[method](absUrl, ...arguments)
            .finally(response => this.update(response))
      }
    })
  }

  by(id: String): Promise {
    return this.resource.one(id).get()
  }

  all(): Promise {
    return this.resource.all().get()
  }

  current(): Promise {
    const entityId = this.selected.entity

    return entityId ? this.resource.by(entityId) : Promise.resolve(null)
  }

  select(id: String): Promise {
    this.selected.entity = id

    return this.current()
  }
}

export const service = ({name, baseUrl, model, parent}) => new RestService(...arguments)
