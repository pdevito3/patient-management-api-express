/**
 * Validation exception for domain validation errors
 */
export interface ValidationFailure {
  propertyName: string;
  errorMessage: string;
}

export class ValidationException extends Error {
  public readonly errors: Record<string, string[]>;

  constructor();
  constructor(failures: ValidationFailure[]);
  constructor(failure: ValidationFailure);
  constructor(errorPropertyName: string, errorMessage: string);
  constructor(errorMessage: string);
  constructor(
    param?: ValidationFailure[] | ValidationFailure | string,
    errorMessage?: string
  ) {
    if (!param && !errorMessage) {
      super('One or more validation failures have occurred.');
      this.errors = {};
    } else if (Array.isArray(param)) {
      super('One or more validation failures have occurred.');
      this.errors = this.groupValidationFailures(param);
    } else if (typeof param === 'object' && param !== null) {
      super(param.errorMessage);
      this.errors = {
        [param.propertyName]: [param.errorMessage]
      };
    } else if (typeof param === 'string' && errorMessage) {
      super(errorMessage);
      this.errors = {
        [param]: [errorMessage]
      };
    } else if (typeof param === 'string') {
      super(param);
      this.errors = {
        ['Validation Exception']: [param]
      };
    } else {
      super('One or more validation failures have occurred.');
      this.errors = {};
    }

    this.name = 'ValidationException';
  }

  private groupValidationFailures(failures: ValidationFailure[]): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    
    for (const failure of failures) {
      if (!result[failure.propertyName]) {
        result[failure.propertyName] = [];
      }
      result[failure.propertyName].push(failure.errorMessage);
    }
    
    return result;
  }

  public static throwWhenNullOrEmpty(value: string, message: string): void {
    if (value === null || value === undefined || value === '') {
      throw new ValidationException(message);
    }
  }

  public static throwWhenNullOrWhitespace(value: string, message: string): void {
    if (value === null || value === undefined || value.trim() === '') {
      throw new ValidationException(message);
    }
  }

  public static throwWhenEmpty(value: string | any[], message: string): void {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        throw new ValidationException(message);
      }
    } else if (value === '') {
      throw new ValidationException(message);
    }
  }

  public static throwWhenNull(value: any, message: string): void {
    if (value === null || value === undefined) {
      throw new ValidationException(message);
    }
  }

  public static must(condition: boolean, message: string): void {
    if (!condition) {
      throw new ValidationException(message);
    }
  }

  public static mustNot(condition: boolean, message: string): void {
    if (condition) {
      throw new ValidationException(message);
    }
  }
}
