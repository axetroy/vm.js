import * as es5 from "./es5";
import { ES2016Map } from "../type";

const BinaryExpressionOperatorEvaluateMap = {
  ...es5.BinaryExpressionOperatorEvaluateMap,
  "**": (a, b) => Math.pow(a, b)
};

export const es2016: ES2016Map = {
  BinaryExpression(path) {
    const { node } = path;
    return BinaryExpressionOperatorEvaluateMap[node.operator](
      path.evaluate(path.createChild(node.left)),
      path.evaluate(path.createChild(node.right))
    );
  }
};
