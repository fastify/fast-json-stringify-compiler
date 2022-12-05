import { Options } from 'fast-json-stringify'

type FastJsonStringify = SerializerSelector.SerializerCompiler

declare namespace SerializerSelector {
  export type SerializerCompiler = (
    externalSchemas: unknown,
    options: Options
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

  export type { Options }
  export function SerializerSelector(): FastJsonStringify;
  export function StandaloneSerializer(options: StandaloneOptions): SerializerCompiler;

  export { SerializerSelector as default }
}

declare function SerializerSelector(): FastJsonStringify;
export = SerializerSelector