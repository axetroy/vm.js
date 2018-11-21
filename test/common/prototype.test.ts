import test from "ava";
import vm from "../../src/vm";

test("set prototype with a hole object", t => {
  const sandbox: any = vm.createContext({});

  const { man, Man } = vm.runInContext(
    `
function Man(){

}

Man.prototype = {
  say: function(){

  }
};

module.exports = {man: new Man(), Man: Man};
    `,
    sandbox
  );
  t.deepEqual(typeof Man, "function");
  t.deepEqual(typeof man.say, "function");
  t.true(man.say === man.__proto__.say);
});

test("Multiple prototype", t => {
  const sandbox: any = vm.createContext({});

  const { man, Man, name } = vm.runInContext(
    `
function Man () {

}

Man.prototype.name = "axetroy"

Man.prototype.whoami = function () {
  return this.name
}

const man = new Man();

module.exports = { Man, man }
    `,
    sandbox
  );
  t.deepEqual(typeof Man, "function");
  t.deepEqual(man.name, "axetroy");
  t.deepEqual(Object.keys(man).length, 0);
});

test("Multiple prototype", t => {
  const sandbox: any = vm.createContext({});

  const { man, Man, name } = vm.runInContext(
    `
function Man () {

}

const prototype = Man.prototype

prototype.name = "axetroy"

prototype.whoami = function () {
  return this.name
}

const man = new Man();

module.exports = { Man, man }
    `,
    sandbox
  );
  t.deepEqual(typeof Man, "function");
  t.deepEqual(man.name, "axetroy");
  t.deepEqual(Object.keys(man).length, 0);
});
