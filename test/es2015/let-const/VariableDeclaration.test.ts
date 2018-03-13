import test from "ava";
import { ErrDuplicateDeclard } from "../../../src/error";
import vm from "../../../src/vm";

test("VariableDeclaration-const", t => {
  const sandbox: any = vm.createContext({});

  const a: any = vm.runInContext(
    `
const a = 123;

module.exports = a;
  `,
    sandbox
  );

  t.deepEqual(a, 123);
});

test("VariableDeclaration-let", t => {
  const sandbox: any = vm.createContext({});

  const a: any = vm.runInContext(
    `
let a = 123;

module.exports = a;
  `,
    sandbox
  );

  t.deepEqual(a, 123);
});

test("VariableDeclaration-duplicate-let", t => {
  const sandbox: any = vm.createContext({});

  t.throws(function() {
    vm.runInContext(
      `
let a = 123;

let a = 321;

module.exports = a;
    `,
      sandbox
    );
  }, ErrDuplicateDeclard("a").message);
});

test("VariableDeclaration-duplicate-const", t => {
  const sandbox: any = vm.createContext({});

  t.throws(function() {
    vm.runInContext(
      `
const a = 123;

const a = 321;

module.exports = a;
    `,
      sandbox
    );
  }, ErrDuplicateDeclard("a").message);
});

test("VariableDeclaration-duplicate-with-context-let", t => {
  const sandbox: any = vm.createContext({
    global: "hello"
  });

  t.throws(function() {
    vm.runInContext(
      `
let global = "world"
module.exports = global;
      `,
      sandbox
    );
  }, ErrDuplicateDeclard("global").message);
});

test("VariableDeclaration-duplicate-with-context-const", t => {
  const sandbox: any = vm.createContext({
    global: "hello"
  });

  t.throws(function() {
    vm.runInContext(
      `
let global = "world"
module.exports = global;
      `,
      sandbox
    );
  }, ErrDuplicateDeclard("global").message);
});

test("VariableDeclaration-define let then cover", t => {
  const sandbox: any = vm.createContext({});

  const output = vm.runInContext(
    `
let name = "hello"
name = "world"  // cover the name, it should throw an error
module.exports = {name: name}
      `,
    sandbox
  );
  t.deepEqual(output.name, "world");
});

test("VariableDeclaration-define const then cover", t => {
  const sandbox: any = vm.createContext({});

  t.throws(function() {
    vm.runInContext(
      `
const name = "hello"
name = "world"  // cover the name, it should throw an error
module.exports = {name: name}
      `,
      sandbox
    );
  }, new TypeError("Assignment to constant variable.").message);
});

// FIXME: let and const should have block scope
// test("block scope", t => {
//   const sandbox: any = vm.createContext({});

//   const { a, b } = vm.runInContext(
//     `
// var a = 1;
// var b;
// {
//   // should have block scope
//   const a = 2;
//   b =a;
// }
// module.exports = {a:a, b:b}
//     `,
//     sandbox
//   );

//   t.deepEqual(a, 1);
//   t.deepEqual(b, 2);
// });
