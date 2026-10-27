'use strict'

const { test } = require('node:test')
const FjsCompiler = require('../index')

test('reuse compiled serializer for the same schema object', t => {
  const schema = {
    type: 'object',
    properties: {
      value: { type: 'string' }
    }
  }

  const factory = FjsCompiler()
  const compiler = factory({})

  const first = compiler({ schema })
  const second = compiler({ schema })

  t.assert.strictEqual(first, second)
})

test('compile different schema objects independently', t => {
  const factory = FjsCompiler()
  const compiler = factory({})

  const first = compiler({ schema: { type: 'string' } })
  const second = compiler({ schema: { type: 'number' } })

  t.assert.notStrictEqual(first, second)
})

test('isolate caches between selector instances', t => {
  const schema = { type: 'string' }

  const firstCompiler = FjsCompiler()({})
  const secondCompiler = FjsCompiler()({})

  const first = firstCompiler({ schema })
  const second = secondCompiler({ schema })

  t.assert.notStrictEqual(first, second)
})

test('handle schema duplicated in externalSchemas', t => {
  const schema = {
    $id: 'schema1',
    type: 'number'
  }

  const externalSchemas = {
    schema1: schema,
    schema2: {
      $id: 'schema2',
      type: 'string'
    }
  }

  const compiler = FjsCompiler()(externalSchemas)
  const serializer = compiler({ schema })

  t.assert.strictEqual(serializer(42), '42')
})

test('isolate caches between factory instances', t => {
  const schema = { type: 'string' }
  const selector = FjsCompiler()

  const firstCompiler = selector({})
  const secondCompiler = selector({})

  const first = firstCompiler({ schema })
  const second = secondCompiler({ schema })

  t.assert.notStrictEqual(first, second)
})
