import test from "ava";
import vm from "../../../src/vm";

test("ObjectExpression", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
const obj = {
  i: 0
};

module.exports = obj;
  `,
    sandbox
  );

  t.true(typeof obj.i === "number");
  t.deepEqual(obj.i, 0);
});
