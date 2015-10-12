'use strict'

import * as http from '../dist/http'
import * as gooey from '../node_modules/gooey/dist/index'

export class Resource extends http.Http {

  constructor(base: String, slug: String, collection: Boolean = true) {
    super(base) // TODO

    this.base = base
    this.slug = slug
    this.collection = collection
  }

  one(id: String): Resource {
    const resource = this.copy()

    resource.slug = id
    resource.collection = false

    return resource
  }

  all(): Resource {
    const resource = this.copy()

    resource.slug = id
    resource.collection = true

    return resource
  }

  copy(): Resource {
    return new Resource(this.base, this.slug, this.collection)
  }

}

export class Service extends gooey.Service {

  constructor(base: String, name: String, model: Function, parent: Service, children: Array) {
    super(...Array.from(arguments).slice())

    this.resource = new Resource(base, name, model) // TODO - base
    this.selected = {entity: null}

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

export const service = ({base, name, model, parent}) => new RestService(...arguments)
