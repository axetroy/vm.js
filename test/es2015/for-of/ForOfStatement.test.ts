import test from "ava";
import { ErrInvalidIterable } from "../../../src/error";
import vm from "../../../src/vm";

test("ForOfStatement-invalid Iterator", t => {
  const sandbox: any = vm.createContext({});

  t.throws(function() {
    vm.runInContext(
      `
  const obj = {a: 1};
  
  const result = [];
  
  for (let value of obj){
    result.push(value);
  }
  
  module.exports = result;
    `,
      sandbox
    );
  }, ErrInvalidIterable("obj").message);
});

test("ForOfStatement-array", t => {
  const sandbox: any = vm.createContext({});

  const arr = vm.runInContext(
    `
const array = [1, 2, 3, 4];

const result = [];

for (let value of array){
  result.push(value);
}

module.exports = result;
  `,
    sandbox
  );

  t.deepEqual(arr, [1, 2, 3, 4]);
});

test("ForOfStatement-without var", t => {
  const sandbox: any = vm.createContext({});

  const { result: arr, value } = vm.runInContext(
    `
const array = [1, 2, 3, 4];

const result = [];

for (value of array){
  result.push(value);
}

module.exports = {result: result, value: value};
  `,
    sandbox
  );

  t.deepEqual(arr, [1, 2, 3, 4]);
  t.deepEqual(value, 4);
});
