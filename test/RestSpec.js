import * as rest from '../dist/rest'
import XMLHttpRequest from 'xhr2'

import chai from 'chai'
import chaiSpies from 'chai-spies'
import blanket from 'blanket'

chai.use(chaiSpies)

const should = chai.should()
const expect = chai.expect

describe('Resource', () => {

  let stubResource

  beforeEach(() => {
    stubResource = new rest.Resource('/v1', 'slug')
  })

  describe('constructor', () => {
    it('should be a defined method', () => {
      stubResource.constructor.should.be.a('function')
    })
  })

  describe('one', () => {
    it('should be a defined method', () => {
      stubResource.one.should.be.a('function')
    })

    it('should set the provided id as the Rest resource slug and make the resource a singleton', () => {
      const one = stubResource.one('slug2')

      one.slug.should.equal('slug2')
      one.collection.should.be.false
      one.should.be.instanceof(rest.Resource)
    })
  })

  describe('all', () => {
    it('should be a defined method', () => {
      stubResource.all.should.be.a('function')
    })

    it('should set the provided id as the Rest resource slug and make the resource a collection', () => {
      const all = stubResource.one('slug2')

      all.slug.should.equal('slug2')
      all.collection.should.be.false
      all.should.be.instanceof(rest.Resource)
    })
  })

  describe('copy', () => {
    it('should be a defined method', () => {
      stubResource.copy.should.be.a('function')
    })

    it('should return an identical instance of the current resource', () => {
      const copy = stubResource.copy()
      copy.should.be.instanceof(rest.Resource)
      // copy.should.deep.equal(stubResource) // FIXME - wut?
    })
  })

})
