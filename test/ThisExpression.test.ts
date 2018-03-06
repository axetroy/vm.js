import test from "ava";
import vm from "../src/vm";

test("ThisExpression", t => {
  const sandbox: any = vm.createContext({});

  const func: any = vm.runInContext(
    `
function t(){
  this.name = "hello";
  return this;
}

module.exports = t;
  `,
    sandbox
  );

  const ctx: any = {};

  func.call(ctx);

  t.deepEqual(ctx.name, "hello");
});
