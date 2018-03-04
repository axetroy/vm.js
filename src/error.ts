export class ErrNotDefined extends ReferenceError {
  constructor(varName: string) {
    super(`${varName} is not defined`);
  }
}

export class ErrNotSupport extends SyntaxError {
  constructor(syntax: string) {
    super(`The Syntax '${syntax}' is not support`);
  }
}
