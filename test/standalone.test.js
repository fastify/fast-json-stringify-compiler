'use strict'

const fs = require('fs')
const path = require('path')
const t = require('tap')
const fastify = require('fastify')
const sanitize = require('sanitize-filename')

const FjsStandaloneCompiler = require('../standalone')

function generateFileName (routeOpts) {
  return `/fjs-generated-${sanitize(routeOpts.schema.$id)}-${routeOpts.method}-${routeOpts.httpPart}-${sanitize(routeOpts.url)}.js`
}

t.test('errors', t => {
  t.plan(2)
  t.throws(() => {
    FjsStandaloneCompiler()
  }, 'missing restoreFunction')
  t.throws(() => {
    FjsStandaloneCompiler({ readMode: false })
  }, 'missing storeFunction')
})

t.test('generate standalone code', t => {
  t.plan(5)

  const base = {
    $id: 'urn:schema:base',
    definitions: {
      hello: { type: 'string' }
    },
    type: 'object',
    properties: {
      hello: { $ref: '#/definitions/hello' }
    }
  }

  const refSchema = {
    $id: 'urn:schema:ref',
    type: 'object',
    properties: {
      hello: { $ref: 'urn:schema:base#/definitions/hello' }
    }
  }

  const endpointSchema = {
    schema: {
      $id: 'urn:schema:endpoint',
      $ref: 'urn:schema:ref'
    }
  }

  const schemaMap = {
    [base.$id]: base,
    [refSchema.$id]: refSchema
  }

  const factory = FjsStandaloneCompiler({
    readMode: false,
    storeFunction (routeOpts, schemaValidationCode) {
      t.same(routeOpts, endpointSchema)
      t.type(schemaValidationCode, 'string')
      fs.writeFileSync(path.join(__dirname, '/fjs-generated.js'), schemaValidationCode)
      t.pass('stored the validation function')
    }
  })

  const compiler = factory(schemaMap)
  compiler(endpointSchema)
  t.pass('compiled the endpoint schema')

  t.test('usage standalone code', t => {
    t.plan(3)
    const standaloneSerializer = require('./fjs-generated')
    t.ok(standaloneSerializer)

    const valid = standaloneSerializer({ hello: 'world' })
    t.same(valid, JSON.stringify({ hello: 'world' }))

    const invalid = standaloneSerializer({ hello: [] })
    t.same(invalid, '{"hello":""}')
  })
})

t.test('fastify integration - writeMode', async t => {
  t.plan(4)

  const factory = FjsStandaloneCompiler({
    readMode: false,
    storeFunction (routeOpts, schemaSerializationCode) {
      const fileName = generateFileName(routeOpts)
      t.ok(routeOpts)
      fs.writeFileSync(path.join(__dirname, fileName), schemaSerializationCode)
      t.pass(`stored the validation function ${fileName}`)
    },
    restoreFunction () {
      t.fail('write mode ON')
    }
  })

  const app = buildApp(factory)
  await app.ready()
})

t.test('fastify integration - readMode', async t => {
  t.plan(6)

  const factory = FjsStandaloneCompiler({
    readMode: true,
    storeFunction () {
      t.fail('read mode ON')
    },
    restoreFunction (routeOpts) {
      const fileName = generateFileName(routeOpts)
      t.pass(`restore the validation function ${fileName}}`)
      return require(path.join(__dirname, fileName))
    }
  })

  const app = buildApp(factory)
  await app.ready()

  let res = await app.inject({
    url: '/foo',
    method: 'POST'
  })
  t.equal(res.statusCode, 200)
  t.equal(res.payload, JSON.stringify({ hello: 'world' }))

  res = await app.inject({
    url: '/bar?lang=it',
    method: 'GET'
  })
  t.equal(res.statusCode, 200)
  t.equal(res.payload, JSON.stringify({ lang: 'en' }))
})

function buildApp (factory) {
  const app = fastify({
    exposeHeadRoutes: false,
    jsonShorthand: false,
    schemaController: {
      compilersFactory: {
        buildSerializer: factory
      }
    }
  })

  app.addSchema({
    $id: 'urn:schema:foo',
    type: 'object',
    properties: {
      name: { type: 'string' },
      id: { type: 'integer' }
    }
  })

  app.post('/foo', {
    schema: {
      response: {
        200: {
          $id: 'urn:schema:response',
          type: 'object',
          properties: {
            hello: { $ref: 'urn:schema:foo#/properties/name' }
          }
        }
      }
    }
  }, () => { return { hello: 'world' } })

  app.get('/bar', {
    schema: {
      response: {
        200: {
          $id: 'urn:schema:response:bar',
          type: 'object',
          properties: {
            lang: { type: 'string', enum: ['it', 'en'] }
          }
        }
      }
    }
  }, () => { return { lang: 'en' } })

  return app
}