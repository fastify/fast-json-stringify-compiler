import { expectAssignable, expectType } from "tsd";
import SerializerSelector, {
  RouteDefinition,
  SerializerCompiler,
  SerializerSelector as SerializerSelectorNamed,
  StandaloneSerializer,
} from "..";

/**
 * SerializerSelector
 */

{
  const compiler = SerializerSelector();
  expectType<SerializerCompiler>(compiler);
}

{
  const compiler = SerializerSelectorNamed();
  expectType<SerializerCompiler>(compiler);
}

/**
 * StandaloneSerializer
 */

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