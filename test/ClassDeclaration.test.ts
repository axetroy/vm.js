import test from "ava";
import * as fs from "fs";

import vm from "../src/vm";

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

// test("ClassDeclaration-property", t => {
//   const sandbox: any = vm.createContext({});

//   const People: any = vm.runInContext(
//     `
// class People{
//   age = 21;
//   constructor(name){
//     this.name = name;
//   }
//   getAge(){
//     return this.age;
//   }
// }

// module.exports = People;
//   `,
//     sandbox
//   );

//   const people = new People("axetroy");

//   t.deepEqual(people.name, "axetroy");
//   t.deepEqual(people.age, 21);
//   t.deepEqual(people.getAge(), 21);
//   t.true(people instanceof People);
// });

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
