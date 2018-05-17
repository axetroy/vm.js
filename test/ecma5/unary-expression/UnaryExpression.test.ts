import test from "ava";
import vm from "../../../src/vm";

test("typeof", t => {
  const sandbox: any = vm.createContext({});

  const type: any = vm.runInContext(
    `
module.exports = typeof 123;
  `,
    sandbox
  );

  t.deepEqual(type, "number");
});

test("typeof before defined", t => {
  const sandbox: any = vm.createContext({});

  const type: any = vm.runInContext(
    `

module.exports = typeof a; // a is not defined, it should equal 'undefined'
  `,
    sandbox
  );

  t.deepEqual(type, "undefined");
});

test("typeof before var", t => {
  const sandbox: any = vm.createContext({});

  const type: any = vm.runInContext(
    `

module.exports = typeof a;
var a;
  `,
    sandbox
  );

  t.deepEqual(type, "undefined");
});

test("void", t => {
  const sandbox: any = vm.createContext({});

  const type: any = vm.runInContext(
    `
module.exports = void 123;
  `,
    sandbox
  );

  t.deepEqual(type, undefined);
});

test("delete", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
const obj = {
  a: 123
};

delete obj.a;

module.exports = obj;
  `,
    sandbox
  );

  t.deepEqual(obj.a, undefined);
  t.deepEqual(Object.keys(obj).length, 0);
});

test("!", t => {
  const sandbox: any = vm.createContext({});

  const isTrue: any = vm.runInContext(
    `
const isTrue = !false;

module.exports = isTrue;
  `,
    sandbox
  );
  t.true(isTrue);
});

test("+", t => {
  const sandbox: any = vm.createContext({});

  const num: any = vm.runInContext(
    `
const num = +("123");

module.exports = num;
  `,
    sandbox
  );
  t.deepEqual(num, 123);
});

test("-", t => {
  const sandbox: any = vm.createContext({});

  const num: any = vm.runInContext(
    `
const num = -("123");

module.exports = num;
  `,
    sandbox
  );
  t.deepEqual(num, -123);
});

test("~", t => {
  const sandbox: any = vm.createContext({});

  const num: any = vm.runInContext(
    `
const num = ~("123");

module.exports = num;
  `,
    sandbox
  );
  t.deepEqual(num, -124);
});
