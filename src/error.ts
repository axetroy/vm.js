export class ErrNotDefined extends ReferenceError {
  constructor(varName: string) {
    super(`${varName} is not defined`);
  }
}
