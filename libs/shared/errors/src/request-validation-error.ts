import { ValidationError } from 'class-validator';

import { CustomError } from './custom-error';

export class RequestValidationError extends CustomError {
  statusCode = 400;

  constructor(public readonly errors: ValidationError[]) {
    super('Invalid request parameters');
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeErrors() {
    const messages = extractValidationErrorField(this.errors);
    return messages.map((message) => ({ message }));
  }
}

export function extractValidationErrorField(
  errors: ValidationError[]
): string[] {
  function prependConstraintsWithParentProp(
    parentPath: string,
    error: ValidationError
  ): ValidationError {
    const constraints: ValidationError['constraints'] = {};
    for (const key in error.constraints) {
      constraints[key] = `${parentPath}.${error.constraints[key]}`;
    }
    return Object.assign(Object.assign({}, error), { constraints });
  }

  function mapChildrenToValidationErrors(
    error: ValidationError,
    parentPath?: string
  ): ValidationError[] {
    if (!error.children?.length) {
      return [error];
    }
    const validationErrors: ValidationError[] = [];
    // eslint-disable-next-line no-param-reassign
    parentPath = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;
    for (const item of error.children) {
      if (item.children?.length) {
        validationErrors.push(
          ...mapChildrenToValidationErrors(item, parentPath)
        );
      }
      validationErrors.push(prependConstraintsWithParentProp(parentPath, item));
    }
    return validationErrors;
  }
  return errors
    .flatMap((error) => mapChildrenToValidationErrors(error))
    .filter((item) => !!item.constraints)
    .flatMap((item) => Object.values(item.constraints));
}

export function requestValidationErrorFactory(
  validationErrors: ValidationError[]
) {
  return new RequestValidationError(validationErrors);
}

export const isRequestValidationError = (
  error: Error
): error is RequestValidationError => error instanceof RequestValidationError;
