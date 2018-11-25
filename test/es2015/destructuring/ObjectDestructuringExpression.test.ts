import test from "ava";
import vm from "../../../src/vm";

test("ObjectDestructuringExpression-object", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
const {a, b, c} = {a: 1, b: 2, c: 3};

module.exports = {a: a, b: b, c: c};
  `,
    sandbox
  );

  t.deepEqual(obj.a, 1);
  t.deepEqual(obj.b, 2);
  t.deepEqual(obj.c, 3);
});

test("ObjectDestructuringExpression-object-with-alias-name", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
const {a: _a, b: _b, c: _c} = {a: 1, b: 2, c: 3};

module.exports = {a: _a, b: _b, c: _c};
  `,
    sandbox
  );

  t.deepEqual(obj.a, 1);
  t.deepEqual(obj.b, 2);
  t.deepEqual(obj.c, 3);
});

test("ObjectDestructuringExpression-array", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
const [a, b, c] = [1, 2, 3];

module.exports = {a: a, b: b, c: c};
  `,
    sandbox
  );

  t.deepEqual(obj.a, 1);
  t.deepEqual(obj.b, 2);
  t.deepEqual(obj.c, 3);
});

test("ObjectDestructuringExpression-array-with-alias-name", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
const [a: _a, b: _b, c: _c] = [1, 2, 3];

module.exports = {a: _a, b: _b, c: _c};
  `,
    sandbox
  );

  t.deepEqual(obj.a, 1);
  t.deepEqual(obj.b, 2);
  t.deepEqual(obj.c, 3);
});

test("Invalid array DestructuringExpression", t => {
  const sandbox: any = vm.createContext({});

  t.throws(() => {
    vm.runInContext(
      `
      const [a, b, c] = {};
      
      module.exports = {a: _a, b: _b, c: _c};
    `,
      sandbox
    );
  }, "{(intermediate value)} is not iterable");
});
