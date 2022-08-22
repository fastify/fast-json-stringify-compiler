import { SerializerCompiler } from '.'

export type RouteDefinition = {
  method: string,
  url: string,
  httpStatus: string,
  schema?: unknown,
}

export interface Options {
  readMode: Boolean,
  storeFunction?(opts: RouteDefinition, schemaSerializationCode: string): void,
  restoreFunction?(opts: RouteDefinition): void,
}

export function StandaloneSerializer(options: Options): SerializerCompiler;
export default StandaloneSerializer
