/**
 * Validation exception for domain validation errors
 */
export class ValidationException extends Error {
  constructor(
    public readonly field: string,
    message: string
  ) {
    super(message);
    this.name = 'ValidationException';
  }
}
