import test from "ava";
import vm from "../../../src/vm";

test("new target without new", t => {
  const sandbox: any = vm.createContext({});

  const Person = vm.runInContext(
    `
function Person(name){
  return new.target;
}

module.exports = Person;
  `,
    sandbox
  );

  t.deepEqual(Person(), undefined);
});

test("new target with new", t => {
  const sandbox: any = vm.createContext({});

  const { Person, target } = vm.runInContext(
    `
var target;

function Person(name){
  target = new.target;
}

new Person();

module.exports = {target: target, Person: Person};
  `,
    sandbox
  );

  t.true(target === Person);
});
