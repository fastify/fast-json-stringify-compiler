import { Options as FJSOptions } from 'fast-json-stringify'

export type { Options } from 'fast-json-stringify'

export type SerializerCompiler = (
  externalSchemas: unknown,
  options: FJSOptions
) => (doc: any) => string;

export type RouteDefinition = {
  method: string,
  url: string,
  httpStatus: string,
  schema?: unknown,
}

export interface StandaloneOptions {
  readMode: Boolean,
  storeFunction?(opts: RouteDefinition, schemaSerializationCode: string): void,
  restoreFunction?(opts: RouteDefinition): void,
}

declare function SerializerSelector(): SerializerCompiler;
declare function StandaloneSerializer(options: StandaloneOptions): SerializerCompiler;

export default SerializerSelector;
export {
  SerializerSelector,
  StandaloneSerializer,
};
