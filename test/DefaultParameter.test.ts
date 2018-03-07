import test from "ava";

import vm from "../src/vm";

test("DefaultParameter-1", t => {
  const sandbox: any = vm.createContext({});

  const func: any = vm.runInContext(
    `
function say(name = "axetroy"){
  return "hello " + name;
};
module.exports = say;
  `,
    sandbox
  );
  t.deepEqual(func(), "hello axetroy");
  t.deepEqual(func("world"), "hello world");
});

test("DefaultParameter-2", t => {
  const sandbox: any = vm.createContext({});

  const People: any = vm.runInContext(
    `
function People(name, age, address = "NanNing") {
  this.name = name;
  this.age = age;
  this.address = address;
}
module.exports = People;
  `,
    sandbox
  );
  const p = new People("axetroy", 21);
  t.deepEqual(p.name, "axetroy");
  t.deepEqual(p.age, 21);
  t.deepEqual(p.address, "NanNing");

  const p2 = new People("axetroy", 21, "HangZhou");
  t.deepEqual(p2.name, "axetroy");
  t.deepEqual(p2.age, 21);
  t.deepEqual(p2.address, "HangZhou");
});
