import test from "ava";
import vm from "../src/vm";

test("SpreadElement-1", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
const obj = {
  isTrue: false
};

module.exports = {...obj};
  `,
    sandbox
  );

  t.true(typeof obj.isTrue === "boolean");
  t.false(obj.isTrue);
});

test("SpreadElement-2", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
const obj1 = {
  1: true,
  2: false
};

const obj2 = {
  1: false,
  2: true,
  name: "hello"
};

module.exports = {...obj1, ...obj2};
  `,
    sandbox
  );

  t.false(obj[1]);
  t.true(obj[2]);
  t.deepEqual(obj.name, "hello");
});

test("SpreadElement-3", t => {
  const sandbox: any = vm.createContext({});

  const arr: any = vm.runInContext(
    `
const arr1 = [1,2,3]

const arr2 = [4,5,6]

module.exports = [...arr1, ...arr2];
  `,
    sandbox
  );

  t.deepEqual(arr, [1, 2, 3, 4, 5, 6]);
});

test("SpreadElement-4", t => {
  const sandbox: any = vm.createContext({});

  const arr: any = vm.runInContext(
    `
const arr1 = [1, 2, 3];

const obj1 = {4: true, 5: true};

module.exports = [...arr1, ...obj1];
  `,
    sandbox
  );

  t.deepEqual(arr, [1, 2, 3]);
});

test("SpreadElement-5", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
const arr1 = [1, 2, 3];

const obj1 = {4: true, 5: true};

module.exports = {...arr1, ...obj1};
  `,
    sandbox
  );

  t.deepEqual(obj, {
    0: 1,
    1: 2,
    2: 3,
    4: true,
    5: true
  });
});
