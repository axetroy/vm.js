import test from "ava";
import vm from "../../../src/vm";

test("LogicalExpression-or-1", t => {
  const sandbox: any = vm.createContext({});

  const num: any = vm.runInContext(
    `
module.exports = 0 || 2;
  `,
    sandbox
  );

  t.deepEqual(num, 2);
});

test("LogicalExpression-or-2", t => {
  const sandbox: any = vm.createContext({});

  const num: any = vm.runInContext(
    `
module.exports = 1 || 2;
  `,
    sandbox
  );

  t.deepEqual(num, 1);
});

test("LogicalExpression-and-1", t => {
  const sandbox: any = vm.createContext({});

  const num: any = vm.runInContext(
    `
module.exports = 1 && 2;
  `,
    sandbox
  );

  t.deepEqual(num, 2);
});

test("LogicalExpression-and-2", t => {
  const sandbox: any = vm.createContext({});

  const num: any = vm.runInContext(
    `
module.exports = 0 && 2;
  `,
    sandbox
  );

  t.deepEqual(num, 0);
});
