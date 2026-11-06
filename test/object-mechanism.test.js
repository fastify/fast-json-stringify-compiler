'use strict'

const { test } = require('node:test')
const fastify = require('fastify')
const FjsCompiler = require('../index')

const userSchema = Object.freeze({
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'name']
})

test('objectMechanism is forwarded to fast-json-stringify', t => {
  t.plan(1)
  const factory = FjsCompiler()
  t.assert.throws(() => {
    factory({}, { objectMechanism: 'not-a-mechanism' })({ schema: userSchema })
  }, /Unsupported object mechanism not-a-mechanism/)
})

test('objectMechanism: native produces the same output as the default mechanism', t => {
  t.plan(1)
  const factory = FjsCompiler()
  const serializeDefault = factory({}, {})({ schema: userSchema })
  const serializeNative = factory({}, { objectMechanism: 'native' })({ schema: userSchema })

  const input = { id: 1, name: 'alice', passwordHash: 'secret', createdAt: new Date(0) }
  t.assert.equal(serializeNative(input), serializeDefault(input))
})

test('fastify integration with objectMechanism: native', async t => {
  const factory = FjsCompiler()

  const app = fastify({
    serializerOpts: {
      objectMechanism: 'native'
    },
    schemaController: {
      compilersFactory: {
        buildSerializer: factory
      }
    }
  })

  app.get('/', {
    handler: async () => ({ id: 1, name: 'alice', passwordHash: 'secret', createdAt: new Date(0) }),
    schema: {
      response: {
        200: userSchema
      }
    }
  })

  const res = await app.inject({ url: '/', method: 'GET' })

  t.assert.equal(res.statusCode, 200)
  t.assert.equal(res.body, '{"id":1,"name":"alice","createdAt":"1970-01-01T00:00:00.000Z"}')
})
