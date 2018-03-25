import test from "ava";
import { ErrDuplicateDeclard } from "../../../src/error";
import vm from "../../../src/vm";

test("var in for block should cover the parent scope", t => {
  const sandbox: any = vm.createContext({});

  const a: any = vm.runInContext(
    `
var a = 1;

var arr = [1, 2, 3];

for (let i = 0; i < arr.length; i++) {
  var a = arr[i]; // cover parent scope
}

module.exports = a;
  `,
    sandbox
  );
  t.deepEqual(a, 3);
});

test("let in for block should define in it's scope", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
var a = 1;
var b;

const arr = [1, 2, 3];

for (let i = 0; i < arr.length; i++) {
  let a = arr[i]; // define in his block scope
  b = a;
}

module.exports = { a: a, b: b };
  `,
    sandbox
  );
  t.deepEqual(obj.a, 1);
  t.deepEqual(obj.b, 3);
});

test("const in for block should define in it's scope", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
var a = 1;
var b;

const arr = [1, 2, 3];

for (let i = 0; i < arr.length; i++) {
  const a = arr[i]; // define in his block scope
  b = a;
}

module.exports = {a: a, b: b};
  `,
    sandbox
  );
  t.deepEqual(obj.a, 1);
  t.deepEqual(obj.b, 3);
});

test("var in for block and parent scope const some name var", t => {
  const sandbox: any = vm.createContext({});

  t.throws(function() {
    vm.runInContext(
      `
let a = 1;  // define let var
let b;

const arr = [1, 2, 3];

for (let i = 0; i < arr.length; i++) {
  var a = arr[i]; // it should throw
  b = a;
}

module.exports = {a: a};
    `,
      sandbox
    );
  }, ErrDuplicateDeclard("a").message);
});

test("var in for block and parent scope const some name var", t => {
  const sandbox: any = vm.createContext({});

  t.throws(function() {
    vm.runInContext(
      `
let a = 1;  // define let var

const arr = [1, 2, 3];

for (let i = 0; i < arr.length; i++) {
  let a = i;
  let a = 0;  // it should throw an error
}

module.exports = {a: a};
    `,
      sandbox
    );
  }, ErrDuplicateDeclard("a").message);
});
