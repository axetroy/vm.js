import test from "ava";
import vm from "../../../src/vm";

test("ConditionalExpression-1", t => {
  const sandbox: any = vm.createContext({});

  const num: any = vm.runInContext(
    `
module.exports = true ? 1 : 2;
  `,
    sandbox
  );

  t.deepEqual(num, 1);
});

test("ConditionalExpression-or-2", t => {
  const sandbox: any = vm.createContext({});

  const num: any = vm.runInContext(
    `
module.exports = false ? 1 : 2;
  `,
    sandbox
  );

  t.deepEqual(num, 2);
});

test("ConditionalExpression with function call", t => {
  const sandbox: any = vm.createContext({});

  const num: any = vm.runInContext(
    `
function isOnline(){
  return true
}
module.exports = isOnline() ? 1 : 2;
  `,
    sandbox
  );

  t.deepEqual(num, 1);
});

test("ConditionalExpression in function call", t => {
  const sandbox: any = vm.createContext({});

  const isAdult: any = vm.runInContext(
    `
function isAdult(age){
  return age >= 18 ? true : false
}
module.exports = isAdult;
  `,
    sandbox
  );

  t.deepEqual(isAdult(18), true);
  t.deepEqual(isAdult(17.999), false);
});
