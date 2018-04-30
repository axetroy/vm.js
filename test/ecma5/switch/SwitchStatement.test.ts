import test from "ava";
import vm from "../../../src/vm";

test("SwitchStatement", t => {
  const sandbox: any = vm.createContext({});

  const func: any = vm.runInContext(
    `
function t(type) {
  switch (type) {
    case "world":
      return "hi world";
    case "axetroy":
      return "hi axetroy";
    default:
      return "hello world";
  }
}

module.exports = t;
  `,
    sandbox
  );

  t.true(typeof func === "function");
  t.deepEqual(func("world"), "hi world");
  t.deepEqual(func("axetroy"), "hi axetroy");
  t.deepEqual(func("aa"), "hello world");
});

test("SwitchStatement-2", t => {
  const sandbox: any = vm.createContext({});

  const func: any = vm.runInContext(
    `
function t(type) {
  switch (true) {
    case type === "world":
      return "hi world";
    case type === "axetroy":
      return "hi axetroy";
    default:
      return "hello world";
  }
}

module.exports = t;
  `,
    sandbox
  );

  t.true(typeof func === "function");
  t.deepEqual(func("world"), "hi world");
  t.deepEqual(func("axetroy"), "hi axetroy");
  t.deepEqual(func("aa"), "hello world");
});

test("SwitchStatement with continue", t => {
  const sandbox: any = vm.createContext({});

  const func: any = vm.runInContext(
    `
function t(type) {
  const result = [];
  let i = 0;
  while (i < 5) {
    i++;
    switch (type + "") {
      case "0":
        continue;
    }
    result.push(i);
  }
  return result;
}

module.exports = t;
  `,
    sandbox
  );

  // t.deepEqual(func(1), [1, 2, 3, 4, 5]);
  // t.deepEqual(func(2), [1, 2, 3, 4, 5]);

  // the will loop will be continue
  t.deepEqual(func(0), []);
});
