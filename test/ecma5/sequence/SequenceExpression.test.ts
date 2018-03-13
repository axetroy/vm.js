import test from "ava";

import vm from "../../../src/vm";

test("basic", t => {
  const sandbox: any = vm.createContext({});

  const a: any = vm.runInContext(
    `
var a = (1 , 2);

module.exports = a;
  `,
    sandbox
  );
  t.deepEqual(a, 2);
});

test("with call expression", t => {
  const sandbox: any = vm.createContext({});

  const { a, b }: any = vm.runInContext(
    `
var a = (get() , 2);
var b;

function get(){
  b = 3;
}

module.exports = {a: a, b: b};
  `,
    sandbox
  );
  t.deepEqual(a, 2);
  t.deepEqual(b, undefined);
});

test("with call expression", t => {
  const sandbox: any = vm.createContext({});

  const { a, b }: any = vm.runInContext(
    `
var b;    
var a = (get() , 2);

function get(){
  b = 3;
}

module.exports = {a: a, b: b};
  `,
    sandbox
  );
  t.deepEqual(a, 2);
  t.deepEqual(b, 3);
});
