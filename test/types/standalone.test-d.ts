import { expectAssignable, expectType } from "tsd";

import { StandaloneSerializer, RouteDefinition } from "../../";
import { SerializerCompiler } from "../..";

const reader = StandaloneSerializer({
  readMode: true,
  restoreFunction: (route: RouteDefinition) => {
    expectAssignable<RouteDefinition>(route)
  },
});
expectType<SerializerCompiler>(reader);

const writer = StandaloneSerializer({
  readMode: false,
  storeFunction: (route: RouteDefinition, code: string) => {
    expectAssignable<RouteDefinition>(route)
    expectAssignable<string>(code)
  },
});
expectType<SerializerCompiler>(writer);