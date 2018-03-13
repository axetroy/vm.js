import test from "ava";
import vm from "../../../src/vm";

test("basic", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
const obj = {
  i: 0
};
do {
  obj.i++;
} while (obj.i < 3);

module.exports = obj;
  `,
    sandbox
  );

  t.true(typeof obj.i === "number");
  t.deepEqual(obj.i, 3);
});

test("break in do block", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
const obj = {
  i: 0
};
do {
  obj.i++;
  break;
} while (obj.i < 3);

module.exports = obj;
  `,
    sandbox
  );
  t.deepEqual(obj.i, 1);
});

test("do-while in function with return, it should cross block scope", t => {
  const sandbox: any = vm.createContext({});

  const get: any = vm.runInContext(
    `
function get() {
  const obj = {
    i: 0
  };
  do {
    obj.i++;
    return obj;
  } while (obj.i < 3);
}

module.exports =  get;
  `,
    sandbox
  );
  t.deepEqual(get(), { i: 1 });
});
