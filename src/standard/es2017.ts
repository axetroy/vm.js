import { ES2017Map } from "../type";

export const es2017: ES2017Map = {
  AwaitExpression(path) {
    const { next } = path.ctx;
    next(path.evaluate(path.createChild(path.node.argument))); // call next
  }
};
