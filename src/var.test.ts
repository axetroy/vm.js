import test from "ava";
import { Var } from "./var";

test("var", t => {
  const $var = new Var("var", "name", "hello world", {} as any);
  t.deepEqual($var.kind, "var");
  t.deepEqual($var.name, "name");
  t.deepEqual($var.value, "hello world");

  // set var
  $var.set("hello");
  t.deepEqual($var.value, "hello"); // value have been modify
});
