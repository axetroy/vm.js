import test from "ava";
import vm from "../../../src/vm";

test("new target with new", t => {
  const sandbox: any = vm.createContext({});

  const { Person, target } = vm.runInContext(
    `
var target;

class Person{
  constructor(){
    target = new.target;
  }
}

new Person();

module.exports = {target: target, Person: Person};
  `,
    sandbox
  );

  t.true(target === Person);
  t.deepEqual(target.name, "Person");
});
