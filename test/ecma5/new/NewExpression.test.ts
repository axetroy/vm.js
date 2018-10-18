import test from "ava";
import vm from "../../../src/vm";

test("NewExpression", t => {
  const sandbox: any = vm.createContext({});

  const { people, People }: any = vm.runInContext(
    `
function People(name, age){
  this.name = name;
}

module.exports = {
  people: new People("axetroy", 12),
  People: People
};
  `,
    sandbox
  );

  // constructor
  t.deepEqual(People.length, 2);
  t.deepEqual(People.name, "People");

  // entity
  t.true(people instanceof People);
  t.deepEqual(people.name, "axetroy");
  t.true(people.constructor === People);
});
