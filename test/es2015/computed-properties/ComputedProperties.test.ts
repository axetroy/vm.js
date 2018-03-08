import test from "ava";
import vm from "../../../src/vm";

test("ComputedProperties-1", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
const name = "axetroy"
const obj = {
  ["@" + name]: 21
}

module.exports = obj;
  `,
    sandbox
  );

  t.deepEqual(obj, {
    "@axetroy": 21
  });
});

test("ComputedProperties-2", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
var obj = {
  ["x" + foo]: "heh",
  ["y" + bar]: "noo",
  foo: "foo",
  bar: "bar"
};

module.exports = obj;
  `,
    sandbox
  );

  t.deepEqual(obj, {
    xfoo: "heh",
    ybar: "noo",
    foo: "foo",
    bar: "bar"
  });
});

test("ComputedProperties-3", t => {
  const sandbox: any = vm.createContext({});

  const obj: any = vm.runInContext(
    `
var obj = {
  foo: "foo",
  get ["x" + foo](){
    return this.foo
  }
};

module.exports = obj;
  `,
    sandbox
  );

  t.deepEqual(obj.xfoo, "foo");
  t.throws(function() {
    obj.xfoo = 123; // it will throw
  });
});
