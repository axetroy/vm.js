import test from "ava";
import vm from "../../../src/vm";

test("new target with new", t => {
  const sandbox: any = vm.createContext({});

  const { Person, target } = vm.runInContext(
    `
var target;

function Person(name){
  return (() => {
    target = new.target;
    return target;
  })();
}

new Person();

module.exports = {target: target, Person: Person};
  `,
    sandbox
  );

  t.true(target === Person);
});
