import * as http from '../dist/index'

export class Restful extends http.Http {

  constructor(slug: String, model: Function) {
    super() // TODO

    this.slug  = slug
    this.model = model
  }

  one() {

  }

  all() {

  }

}
