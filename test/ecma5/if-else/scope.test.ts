import test from "ava";
import vm from "../../../src/vm";
import { ErrDuplicateDeclard } from "../../../src/error";

test("var in if block should cover the parent scope", t => {
  const sandbox: any = vm.createContext({});

  const a: any = vm.runInContext(
    `
var a = 1;

if (true){
  var a = 2;
}

module.exports = a;
  `,
    sandbox
  );
  t.deepEqual(a, 2);
});

test("let in if block should define in it's scope", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
var a = 1;
var b;

if (true){
  let a = 2;
  b = a;
}

module.exports = { a: a, b: b };
  `,
    sandbox
  );
  t.deepEqual(obj.a, 1);
  t.deepEqual(obj.b, 2);
});

test("const in if block should define in it's scope", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
var a = 1;
var b;

if (true){
  const a = 2;
  b = a;
}

module.exports = {a: a, b: b};
  `,
    sandbox
  );
  t.deepEqual(obj.a, 1);
  t.deepEqual(obj.b, 2);
});

test("var in if block and parent scope let some name var", t => {
  const sandbox: any = vm.createContext({});

  t.throws(function() {
    vm.runInContext(
      `
let a = 1;  // define let var
let b;

if (true){
  var a = 2;
}

module.exports = {a: a};
    `,
      sandbox
    );
  }, new ErrDuplicateDeclard("a").message);
});

test("var in for block and parent scope const some name var", t => {
  const sandbox: any = vm.createContext({});

  t.throws(function() {
    vm.runInContext(
      `
const a = 1;  // define let var

if (true){
  var a = 1;
}

module.exports = {a: a};
    `,
      sandbox
    );
  }, new ErrDuplicateDeclard("a").message);
});
