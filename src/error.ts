export class ErrNotDefined extends ReferenceError {
  constructor(varName: string) {
    super(`Uncaught ReferenceError: ${varName} is not defined`);
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

export class ErrUnexpectedToken extends SyntaxError {
  constructor(token: string = "") {
    super(`Uncaught SyntaxError: Invalid or unexpected token '${token}'`);
  }
}

class ErrIsNot extends TypeError {
  constructor(name: string, type: string) {
    super(`Uncaught TypeError: ${name} is not ${type}`);
  }
}

export class ErrInvalidIterable extends ErrIsNot {
  constructor(name) {
    super(name, "iterable");
  }
}
