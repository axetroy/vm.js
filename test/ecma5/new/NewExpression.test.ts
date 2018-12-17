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

test("NewExpression for built-in functions", t => {
  const sandbox: any = vm.createContext({
    Array,
    Date,
    RegExp
  });

  const { array, date, regexp } = vm.runInContext(
    `
    var array = new Array(1, 2, 3);
    var date = new Date();
    var regexp = new RegExp('abc');

    module.exports = {
      array: array,
      date: date,
      regexp: regexp
    }
  `,
    sandbox
  );

  t.deepEqual(array.length, 3);
  t.true(date <= new Date());
  t.true(regexp instanceof RegExp);
});
