import test from "ava";
import vm from "../../../src/vm";
import { ErrDuplicateDeclard } from "../../../src/error";

test("var in for-of block should cover the parent scope", t => {
  const sandbox: any = vm.createContext({});

  const a: any = vm.runInContext(
    `
var a = 1;

var obj = [1, 2, 3];

for (let ele of obj){
  var a = ele;  // cover parent scope
}

module.exports = a;
  `,
    sandbox
  );
  t.deepEqual(a, 3);
});

test("let in for-of block should define in it's scope", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
var a = 1;
var b;

var obj = [1, 2, 3];

for (let ele of obj){
  let a = ele;
  b = a;
}

module.exports = {a: a, b: b};
  `,
    sandbox
  );
  t.deepEqual(obj.a, 1);
  t.deepEqual(obj.b, 3);
});

test("const in for-of block should define in it's scope", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
var a = 1;
var b;

var a = 1;
var b;

var obj = [1, 2, 3];

for (let ele of obj){
  const a = ele;
  b = a;
}

module.exports = {a: a, b: b};
  `,
    sandbox
  );
  t.deepEqual(obj.a, 1);
  t.deepEqual(obj.b, 3);
});

test("var in for-of block and parent scope const some name var", t => {
  const sandbox: any = vm.createContext({});

  t.throws(function() {
    vm.runInContext(
      `
let a = 1;  // define let var

var a = 1;

var obj = [1, 2, 3];

for (let ele of obj){
  var a = ele; // throw an erro
}

module.exports = {a: a};
    `,
      sandbox
    );
  }, ErrDuplicateDeclard("a").message);
});
