import test from "ava";
import vm from "../../../src/vm";
import {ErrDuplicateDeclard} from "../../../src/error";

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
  }, new ErrDuplicateDeclard("a").message);
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
  }, new ErrDuplicateDeclard("a").message);
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
  }, new ErrDuplicateDeclard("global").message);
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
  }, new ErrDuplicateDeclard("global").message);
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
    vm.runInContext(`
const name = "hello"
name = "world"  // cover the name, it should throw an error
module.exports = {name: name}
      `, sandbox);
  }, new TypeError("Assignment to constant variable.").message);
});
