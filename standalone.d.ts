import { SerializerCompiler } from './index'

export type RouteDefinition = {
  method: string,
  url: string,
  httpStatus: string,
  schema?: unknown,
}

interface Option {
  readMode: Boolean,
  storeFunction?(opts: RouteDefinition, schemaSerializationCode: string): void,
  restoreFunction?(opts: RouteDefinition): void,
}

export declare function StandaloneSerializer(Options): SerializerCompiler;
