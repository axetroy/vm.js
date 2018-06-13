import test from "ava";
import vm from "../../src/vm";

test("allown duplicate object key", t => {
  // TODO
  const sandbox: any = vm.createContext({});
  const obj = vm.runInContext(
    `
  var obj = {
    a: 1,
    a: 2,
  };
  module.exports = obj;
      `,
    sandbox
  );
  t.deepEqual(Object.keys(obj).length, 1);
  t.deepEqual(obj.a, 2);
  t.pass();
});
