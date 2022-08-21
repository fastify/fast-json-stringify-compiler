'use strict'

const SerializerSelector = require('./index')

function StandaloneSerializer (options = { readMode: true }) {
  if (options.readMode === true && !options.restoreFunction) {
    throw new Error('You must provide a restoreFunction options when readMode ON')
  }

  if (options.readMode !== true && !options.storeFunction) {
    throw new Error('You must provide a storeFunction options when readMode OFF')
  }

  if (options.readMode === true) {
    // READ MODE: it behalf only in the restore function provided by the user
    return function wrapper () {
      return function (opts) {
        return options.restoreFunction(opts)
      }
    }
  }

  // WRITE MODE: it behalf on the default SerializerSelector, wrapping the API to run the Ajv Standalone code generation
  const factory = SerializerSelector()
  return function wrapper (externalSchemas, serializerOpts = {}) {
    if (!serializerOpts.mode || serializerOpts.mode !== 'standalone') {
      // to generate the serialization source code, these options are mandatory
      serializerOpts.mode = 'standalone'
    }

    const compiler = factory(externalSchemas, serializerOpts)
    return function (opts) { // { schema/*, method, url, httpPart */ }
      const serializeFuncCode = compiler(opts)

      options.storeFunction(opts, serializeFuncCode)

      // eslint-disable-next-line no-new-func
      return new Function(serializeFuncCode)
    }
  }
}

module.exports = StandaloneSerializer
