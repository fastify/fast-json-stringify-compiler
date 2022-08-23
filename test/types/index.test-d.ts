import { expectType } from "tsd";
import SerializerSelector, {
  SerializerCompiler,
  SerializerSelector as SerializerSelectorNamed,
  StandaloneSerializer,
} from "../..";

{
  const compiler = SerializerSelector();
  expectType<SerializerCompiler>(compiler);
}

{
  const compiler = SerializerSelectorNamed();
  expectType<SerializerCompiler>(compiler);
}