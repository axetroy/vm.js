import test from "ava";
import vm from "../../../src/vm";

test("GeneratoeFunction-1", t => {
  const sandbox: any = vm.createContext({
    name: "world"
  });

  const get = vm.runInContext(
    `
function* get(){
  var a = 123;
  yield a;
}

module.exports = get;
  `,
    sandbox
  );

  const generator = get();
  t.deepEqual(generator.next(), { done: false, value: 123 });
  t.deepEqual(generator.next(), { done: true, value: undefined });
});

test("GeneratoeFunction-2", t => {
  const sandbox: any = vm.createContext({
    name: "world"
  });

  const get = vm.runInContext(
    `
function* get(){
  var a = 123;
  yield a;
  var b = "hello world";
  yield b;
}

module.exports = get;
  `,
    sandbox
  );

  const generator = get();
  t.deepEqual(generator.next(), { done: false, value: 123 });
  t.deepEqual(generator.next(), { done: false, value: "hello world" });
  t.deepEqual(generator.next(), { done: true, value: undefined });
});

test("GeneratoeFunction-3", t => {
  const sandbox: any = vm.createContext({
    name: "world"
  });

  const get = vm.runInContext(
    `
function* get(){
  var a = 123;
  yield a;
  var b = "hello world";
  yield b;
  return 233;
}

module.exports = get;
  `,
    sandbox
  );

  const generator = get();
  t.deepEqual(generator.next(), { done: false, value: 123 });
  t.deepEqual(generator.next(), { done: false, value: "hello world" });
  t.deepEqual(generator.next(), { done: true, value: 233 });
});

test("GeneratoeFunction-4", t => {
  const sandbox: any = vm.createContext({
    name: "world"
  });

  const get = vm.runInContext(
    `
function* get(){
  var a = 123;
  yield a;
  var b = "hello world";
  var c = yield b;
  return c;
}

module.exports = get;
  `,
    sandbox
  );

  const generator = get();
  t.deepEqual(generator.next(), { done: false, value: 123 });
  t.deepEqual(generator.next(), { done: false, value: "hello world" });
  t.deepEqual(generator.next(), { done: true, value: undefined });
});

test("GeneratoeFunction-5", t => {
  const sandbox: any = vm.createContext({
    name: "world"
  });

  const get = vm.runInContext(
    `
function* get(){
  var a = 123;
  yield a;
  var b = "hello world";
  var c = "@" + (yield b);
  return c;
}

module.exports = get;
  `,
    sandbox
  );

  const generator = get();
  t.deepEqual(generator.next(), { done: false, value: 123 });
  t.deepEqual(generator.next(), { done: false, value: "hello world" });
  t.deepEqual(generator.next(), { done: true, value: "@undefined" });
});

test("GeneratoeFunction-5", t => {
  const sandbox: any = vm.createContext({
    name: "world"
  });

  const get = vm.runInContext(
    `
function* get(){
  var a = 123;
  yield a;
  var b = "hello world";
  var c = "@" + (yield b) + "@";
  return c;
}

module.exports = get;
  `,
    sandbox
  );

  const generator = get();
  t.deepEqual(generator.next(), { done: false, value: 123 });
  t.deepEqual(generator.next(), { done: false, value: "hello world" });
  t.deepEqual(generator.next(), { done: true, value: "@undefined@" });
});
