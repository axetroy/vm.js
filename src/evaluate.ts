import * as types from "babel-types";
import { Path } from "./path";
import { IEcmaScriptMap } from "./type";
import { es5 } from "./standard/es5";
import { es2015 } from "./standard/es2015";
import { es2016 } from "./standard/es2016";
import { es2017 } from "./standard/es2017";
import { experimental } from "./standard/experimental";

const visitors: IEcmaScriptMap = {
  ...es5,
  ...es2015,
  ...es2016,
  ...es2017,
  ...experimental
};

export default function evaluate(path: Path<types.Node>) {
  path.evaluate = evaluate;
  const handler = visitors[path.node.type];
  return handler(path);
}
