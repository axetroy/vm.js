import test from "ava";
import vm from "../../../src/vm";
import { ErrNoSuper } from "../../../src/error";

test("ClassDeclaration-contructor", t => {
  const sandbox: any = vm.createContext({});

  const People: any = vm.runInContext(
    `
class People{
  constructor(name){
    this.name = name;
    this.word = "hello " + name;
  }
}

module.exports = People;
  `,
    sandbox
  );

  const people = new People("axetroy");

  t.deepEqual(people.name, "axetroy");
  t.deepEqual(people.word, "hello axetroy");
  t.true(people instanceof People);
  t.true(people.__proto__.constructor === People);
});

test("ClassDeclaration-property", t => {
  const sandbox: any = vm.createContext({});

  const People: any = vm.runInContext(
    `
class People{
  age = 21;
  constructor(name){
    this.name = name;
  }
  getAge(){
    return this.age;
  }
}

module.exports = People;
  `,
    sandbox
  );

  const people = new People("axetroy");

  t.deepEqual(people.name, "axetroy");
  t.deepEqual(people.age, 21);
  t.deepEqual(people.getAge(), 21);
  t.true(people instanceof People);
});

test("ClassDeclaration-method", t => {
  const sandbox: any = vm.createContext({});

  const Base: any = vm.runInContext(
    `
class Base{
  constructor(){
    this.name = "hello world";
  }
  say(word){
    return "hello " + word;
  }
}

module.exports = Base;
  `,
    sandbox
  );

  const base = new Base();

  t.deepEqual(base.name, "hello world");
  t.true(base instanceof Base);
  t.deepEqual(base.say("world"), "hello world");
});

test("ClassDeclaration-getter and setter", t => {
  const sandbox: any = vm.createContext({});

  const People: any = vm.runInContext(
    `
class People{
  constructor(name, age){
    this.name = name;
    this.__age = age;
  }
  get age(){
    return this.__age;
  }
  set age(age){
    this.__age = age;
  }
}

module.exports = People;
  `,
    sandbox
  );

  const people = new People("axetroy", 21);

  t.deepEqual(people.name, "axetroy");
  t.deepEqual(people.__age, 21);
  t.deepEqual(people.age, 21);
  t.true(people instanceof People);

  people.age = 22;
  t.deepEqual(people.__age, 22);
  t.deepEqual(people.age, 22);
});

test("ClassDeclaration-extends", t => {
  const sandbox: any = vm.createContext({});

  const { People } = vm.runInContext(
    `
class Life{
  eat(){

  }
}
class People extends Life{
  learn(){

  }
}

module.exports = {
  Life,
  People
};
  `,
    sandbox
  );
  const people = new People("axetroy");
  t.deepEqual(typeof people.eat, "function"); // inherti from Life
  t.deepEqual(typeof people.learn, "function");
});

test("ClassDeclaration-extends and super-1", t => {
  const sandbox: any = vm.createContext({});

  const { Life, People } = vm.runInContext(
    `
class Life{
  constructor(name){
    this.name = name;
    this.isLife = true;
  }
  eat(){
    this.haveEat = true;
  }
  getSkill(){
    return true;
  }
}
class People extends Life{
  constructor(name){
    super(name);
    this.isPeople = true;
    super.eat();
  }
  learn(){
    return super.getSkill();
  }
}

module.exports = {
  Life,
  People
};
  `,
    sandbox
  );
  const people = new People("axetroy");
  t.deepEqual(typeof people.eat, "function"); // inherit from Life
  t.deepEqual(typeof people.learn, "function");
  t.deepEqual(people.name, "axetroy"); // inherit from Life
  t.true(people.isLife); // inherit from Life
  t.true(people.isPeople);
  t.true(people.__proto__.constructor === People);
  t.true(people.__proto__.__proto__.constructor === Life);
  t.true(people.haveEat); // inherit from Life eat method
  t.true(people.learn()); // inherit from Life getSkill method
});

test("ClassDeclaration-extends and super-2", t => {
  const sandbox: any = vm.createContext({});

  const { People } = vm.runInContext(
    `
class Life{
  constructor(name){
    this.name = name;
    this.isLife = true;
  }
  eat(){
    this.haveEat = true;
  }
  getSkill(){
    return true;
  }
  say(word){
    return "hello " + word;
  }
}
class People extends Life{
  constructor(name){
    super(name);
    this.isPeople = true;
    this.obj = {
      get: super.getSkill,
      say: super.say
    }
  }
  learn(){
    return super.getSkill();
  }
}

module.exports = {
  Life,
  People
};
  `,
    sandbox
  );
  const people = new People("axetroy");
  t.deepEqual(people.obj.get(), true); // class super class method
  t.deepEqual(people.obj.say("world"), "hello world"); // class super class method
});

test("ClassDeclaration-extends without super", t => {
  const sandbox: any = vm.createContext({});

  t.throws(function() {
    vm.runInContext(
      `
class Life{
}
class People extends Life{
  constructor(name){
  }
}

module.exports = new People();
    `,
      sandbox
    );
  }, ErrNoSuper().message);
});

test("ClassDeclaration-extends without super", t => {
  const sandbox: any = vm.createContext({});

  t.throws(function() {
    vm.runInContext(
      `
class Life{
}
class People extends Life{
  constructor(name){
    super()
  }
}

class A extends Life{
  constructor(name){
    // here will throw an error
  }
}

new People();
new A(); // throw error
    `,
      sandbox
    );
  }, ErrNoSuper().message);
});

test("ClassDeclaration-class name and length", t => {
  const sandbox: any = vm.createContext({});

  const People = vm.runInContext(
    `
class People{
  constructor(name){
  }
}

module.exports = People;
  `,
    sandbox
  );

  t.deepEqual(People.length, 1);
  t.deepEqual(People.name, "People");
});

// test("ClassDeclaration-extends use this before super", t => {
//   const sandbox: any = vm.createContext({});

//   t.throws(function() {
//     vm.runInContext(
//       `
// class Life{
// }
// class People extends Life{
//   constructor(name){
//     this.name = 123; // it should throw an error, use 'this' before super()
//     super()
//   }
// }

// new People();
//     `,
//       sandbox
//     );
//   }, ErrNoSuper.message);
// });

test("ClassDeclaration-extends auto super without constructor", t => {
  const sandbox: any = vm.createContext({});

  const people = vm.runInContext(
    `
class Life{
constructor(){
  this.id = 123;
}
}
class People extends Life{

}

module.exports = new People();
  `,
    sandbox
  );
  t.deepEqual(people.id, 123);
});
