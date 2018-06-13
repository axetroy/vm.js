import test from "ava";
import vm from "../../src/vm";

test("overwrite native toString method", t => {
  const sandbox: any = vm.createContext({});

  const { d, Demo } = vm.runInContext(
    `
var Demo = function(text) {};

Demo.prototype = {
  toString: function() {
    return JSON.stringify(this);
  }
};

var d = new Demo();

module.exports = {d: d, Demo: Demo};
    `,
    sandbox
  );
  t.deepEqual(typeof d.toString, "function");
  t.deepEqual(typeof Demo, "function");
  t.true(d.toString === Demo.prototype.toString);
  t.true(d.__proto__ === Demo.prototype);
});

test("overwrite native valueOf method", t => {
  const sandbox: any = vm.createContext({});

  const { d, Demo } = vm.runInContext(
    `
var Demo = function(text) {};

Demo.prototype = {
  valueOf: function() {
    return 1;
  }
};

var d = new Demo();

module.exports = {d: d, Demo: Demo};
    `,
    sandbox
  );
  t.deepEqual(typeof d.toString, "function");
  t.deepEqual(typeof Demo, "function");
  t.true(d.toString === Demo.prototype.toString);
  t.true(d.__proto__ === Demo.prototype);
  t.deepEqual(d + 0, 1);
});
