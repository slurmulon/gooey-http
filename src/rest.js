import * as http from '../dist/index'

export class Restource extends http.Http {

  constructor(slug: String, model: Function, collection: Boolean = true) {
    super() // TODO

    this.slug  = slug
    this.model = model
    this.collection = false
  }

  set one(slug?: String): Restource {

  }

  set all(slug?: String): Restource {

  }

  set byId(id: String): Restource {

  }

  set current(id: String): Restource {

  }

}
