import * as http from '../dist/index'
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

  constructor(name: String, model: Function, parent?: gooey.Service, children?: Array) {
    super(...arguments)

    this.resource = new Rest(name, model)
    this.selected = {entity: null}
  }

  // TODO - add subscription
  by(id: String): Promise {
    return this.resource.one(id).get()
  }

  // TODO - add subscription
  all(): Promise {
    return this.resource.all().get()
  }

  // TODO - add subscription
  current(): Promise {
    const entityId = this.selected.entity

    return entityId ? this.resource.by(entityId) : Promise.resolve(null)
  }

  select(id: String): Promise {
    this.selected.entity = id

    return this.current()
  }
}
