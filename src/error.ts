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

export class ErrDuplicateDeclard extends SyntaxError {
  constructor(varName: string) {
    super(`Identifier '${varName}' has already been declared`);
  }
}
