import test from "ava";
import vm from "../../../src/vm";

test("DoWhileStatement-1", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
const obj = {
  i: 0
};
do {
  obj.i++;
} while (obj.i < 3);

module.exports = obj;
  `,
    sandbox
  );

  t.true(typeof obj.i === "number");
  t.deepEqual(obj.i, 3);
});

test("DoWhileStatement var in do block should cover the parent scope", t => {
  const sandbox: any = vm.createContext({});

  const a: any = vm.runInContext(
    `
var a = 1;

do {
  var a = 2; // parent scope have a = 1, here is the child scope
} while (false);

module.exports = a;
  `,
    sandbox
  );
  t.deepEqual(a, 2);
});

test("DoWhileStatement let in do block should define in it's scope", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
var a = 1;
var b;

do {
  let a = 2;  // have his own scope
  b = a;
} while (false)

module.exports = {a: a, b: b};
  `,
    sandbox
  );
  t.deepEqual(obj.a, 1);
  t.deepEqual(obj.b, 2);
});

test("DoWhileStatement const in do block should define in it's scope", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
var a = 1;
var b;

do {
  const a = 2;  // have his own scope
  b = a;
} while (false)

module.exports = {a: a, b: b};
  `,
    sandbox
  );
  t.deepEqual(obj.a, 1);
  t.deepEqual(obj.b, 2);
});
