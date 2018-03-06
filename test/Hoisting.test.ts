import test from "ava";
import vm from "../src/vm";
import {ErrNotDefined} from "../src/error";

test("Var should Hoisting", async t => {
  const sandbox: any = vm.createContext({});

  const say = vm.runInContext(
    `
module.exports = function(word) {
  const result = prefix + "hello " + word;
  var prefix = 123;
  return result;
};
  `,
    sandbox
  );
  t.deepEqual(say("world"), "undefinedhello world");
});

test("Let should not Hoisting", async t => {
  const sandbox: any = vm.createContext({});

  t.throws(function() {
    vm.runInContext(
      `
console.log(a);
let a = 123;
    `,
      sandbox
    );
  }, new ErrNotDefined("a").message);
});

test("Const should not Hoisting", async t => {
  const sandbox: any = vm.createContext({});

  t.throws(function() {
    vm.runInContext(
      `
console.log(a);
const a = 123;
    `,
      sandbox
    );
  }, new ErrNotDefined("a").message);
});

test("Function should not Hoisting", async t => {
  const sandbox: any = vm.createContext({});

  const say = vm.runInContext(
    `
module.exports = function(word) {
  const result = say(word);
  function say(w) {
    return "hello " + w;
  }
  return result;
};
  `,
    sandbox
  );
  t.deepEqual(say("world"), "hello world");
});

test("For Hoisting", async t => {
  const sandbox: any = vm.createContext({});

  const func = vm.runInContext(
    `
function get() {
  for (let i = 0; i < 1; i++) {
    i++;
    let result = a;
    if (result === undefined) {
      return true;
    }
    var a = 123;
  }
}
module.exports = get;
  `,
    sandbox
  );
  t.true(func());
});

test("If Hoisting", async t => {
  const sandbox: any = vm.createContext({});

  const func = vm.runInContext(
    `
function get() {
  if (a === undefined) {
    return true;
  }
  var a = 123;
}

module.exports = get;
  `,
    sandbox
  );
  t.true(func());
});

test("While Hoisting", async t => {
  const sandbox: any = vm.createContext({});

  const func = vm.runInContext(
    `
function get() {
  while (a === undefined) {
    return true;
  }
  var a = 123;
}

module.exports = get;
  `,
    sandbox
  );
  t.true(func());
});

test("Switch Hoisting", async t => {
  const sandbox: any = vm.createContext({});

  const func = vm.runInContext(
    `
function get() {
  switch(a){
    case undefined:
      return true;
    default:
      return false;
  }
  var a = 123;
}

module.exports = get;
  `,
    sandbox
  );
  t.true(func());
});
