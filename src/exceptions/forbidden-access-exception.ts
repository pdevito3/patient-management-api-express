/**
 * Exception thrown when a user attempts to access a forbidden resource
 */
export class ForbiddenAccessException extends Error {
  constructor();
  constructor(message: string);
  constructor(message: string, innerException: Error);
  constructor(
    message?: string,
    innerException?: Error
  ) {
    if (message === undefined) {
      super('Access to the requested resource is forbidden.');
    } else if (innerException) {
      super(message, { cause: innerException });
    } else {
      super(message);
    }

    this.name = 'ForbiddenAccessException';
  }
}
