import test from "ava";
import vm from "../src/vm";
import {ErrDuplicateDeclard} from "../src/error";

test("VariableDeclaration-var", t => {
  const sandbox: any = vm.createContext({});

  const a: any = vm.runInContext(
    `
var a = 123;

module.exports = a;
  `,
    sandbox
  );

  t.deepEqual(a, 123);
});

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

test("VariableDeclaration-duplicate-var", t => {
  const sandbox: any = vm.createContext({});

  const a: any = vm.runInContext(
    `
var a = 123;

var a = 321;

module.exports = a;
  `,
    sandbox
  );

  t.deepEqual(a, 321);
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

test("VariableDeclaration-duplicate-with-context-var", t => {
  const sandbox: any = vm.createContext({
    global: "hello"
  });

  const g = vm.runInContext(
    `
var global = "world"  // context can not be rewrite
module.exports = global;
    `,
    sandbox
  );

  t.deepEqual(g, "hello");
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

test("VariableDeclaration-replace-context-var", t => {
  const sandbox: any = vm.createContext({
    global: "hello"
  });

  const g = vm.runInContext(
    `
function test(){
  let global = 123;
  return global;
}
module.exports = test();
    `,
    sandbox
  );
  t.deepEqual(g, 123);
});
