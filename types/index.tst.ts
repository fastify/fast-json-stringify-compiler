import { expect } from 'tstyche'
import SerializerSelector, {
  RouteDefinition,
  Serializer,
  SerializerCompiler,
  SerializerFactory,
  SerializerSelector as SerializerSelectorNamed,
  StandaloneSerializer,
} from '..'

/**
 * SerializerSelector
 */

{
  const compiler = SerializerSelector()
  expect(compiler).type.toBe<SerializerFactory>()
}

{
  const compiler = SerializerSelectorNamed()
  expect(compiler).type.toBe<SerializerFactory>()
}

{
  const sampleSchema = {
    $id: 'example1',
    type: 'object',
    properties: {
      name: { type: 'string' }
    }
  }

  const externalSchemas1 = {}

  const factory = SerializerSelector()
  expect(factory).type.toBe<SerializerFactory>()
  const compiler = factory(externalSchemas1, {})
  expect(compiler).type.toBe<SerializerCompiler>()
  const serializeFunc = compiler({ schema: sampleSchema, method: '', url: '', httpStatus: '' })
  expect(serializeFunc).type.toBe<Serializer>()

  expect(serializeFunc({ name: 'hello' })).type.toBe<string>()
}

/**
 * StandaloneSerializer
 */

const reader = StandaloneSerializer({
  readMode: true,
  restoreFunction: (route) => {
    expect(route).type.toBe<RouteDefinition>()
    return {} as Serializer
  },
})
expect(reader).type.toBe<SerializerFactory>()

const writer = StandaloneSerializer({
  readMode: false,
  storeFunction: (route, code) => {
    expect(route).type.toBe<RouteDefinition>()
    expect(code).type.toBe<string>()
  },
})
expect(writer).type.toBe<SerializerFactory>()

{
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
    method: '',
    url: '',
    httpStatus: '',
    schema: {
      $id: 'urn:schema:endpoint',
      $ref: 'urn:schema:ref'
    }
  }

  const schemaMap = {
    [base.$id]: base,
    [refSchema.$id]: refSchema
  }

  expect(StandaloneSerializer).type.not.toBeCallableWith({
    readMode: true,
    storeFunction () { }
  })

  expect(StandaloneSerializer).type.not.toBeCallableWith({
    readMode: false,
    restoreFunction () {}
  })

  expect(StandaloneSerializer).type.not.toBeCallableWith({
    restoreFunction () {}
  })

  expect(StandaloneSerializer({
    storeFunction (routeOpts, schemaSerializerCode) {
      expect(routeOpts).type.toBe<RouteDefinition>()
      expect(schemaSerializerCode).type.toBe<string>()
    }
  })).type.toBe<SerializerFactory>()

  expect(StandaloneSerializer({
    readMode: true,
    restoreFunction (routeOpts) {
      expect(routeOpts).type.toBe<RouteDefinition>()
      return {} as Serializer
    }
  })).type.toBe<SerializerFactory>()

  const factory = StandaloneSerializer({
    readMode: false,
    storeFunction (routeOpts, schemaSerializerCode) {
      expect(routeOpts).type.toBe<RouteDefinition>()
      expect(schemaSerializerCode).type.toBe<string>()
    }
  })
  expect(factory).type.toBe<SerializerFactory>()

  const compiler = factory(schemaMap)
  expect(compiler).type.toBe<SerializerCompiler>()
  expect(compiler(endpointSchema)).type.toBe<Serializer>()
}
