import test from "ava";

import vm from "../src/vm";

test("RestParameter-1", t => {
  const sandbox: any = vm.createContext({});

  const func: any = vm.runInContext(
    `
function say(...families){
  return "hello " + families.join(",");
};
module.exports = say;
  `,
    sandbox
  );
  t.deepEqual(func("a", "b"), "hello a,b");
});

test("RestParameter-2", t => {
  const sandbox: any = vm.createContext({});

  const func: any = vm.runInContext(
    `
function say(...families){
  return families;
};
module.exports = say;
  `,
    sandbox
  );
  t.deepEqual(func("a", "b"), ["a", "b"]);
});
