import test from "ava";
import vm from "../../../src/vm";

test("basic", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
const obj = {
  i: 0
};

module.exports = obj;
  `,
    sandbox
  );

  t.true(typeof obj.i === "number");
  t.deepEqual(obj.i, 0);
});

test("object with method", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
const obj = {
  i: 0,
  get(){
    return this.i;
  }
};

module.exports = obj;
  `,
    sandbox
  );
  t.deepEqual(obj.i, 0);
  t.deepEqual(obj.get(), obj.i);
});

test("object with getter method", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
const obj = {
  i: 0,
  get value(){
    return this.i;
  }
};

module.exports = obj;
  `,
    sandbox
  );
  t.deepEqual(obj.i, 0);
  t.deepEqual(obj.value, obj.i);
});

test("object with setter method", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
const obj = {
  i: 0,
  set value(val){
    this.i = val;
  }
};

module.exports = obj;
  `,
    sandbox
  );
  t.deepEqual(obj.i, 0);
  obj.value = 123;
  t.deepEqual(obj.i, 123);
});
