import { Request, Response, NextFunction } from 'express';
import { ValidationException } from '~/exceptions/validation-exception';
import { NotFoundException } from '~/exceptions/not-found-exception';
import { ForbiddenAccessException } from '~/exceptions/forbidden-access-exception';
import { ProblemDetails, ValidationProblemDetails } from '~/exceptions/problem-details';

export interface ProblemDetailsConfigOptions {
  includeExceptionDetails?: boolean;
  exceptionMappings?: Map<new (...args: any[]) => Error, number>;
  rethrowExceptions?: Array<new (...args: any[]) => Error>;
  ignoreExceptions?: Array<new (...args: any[]) => Error>;
}

export type ExceptionMapperFunction = (req: Request, error: Error) => ProblemDetails | null;

export class ProblemDetailsConfig {
  private includeExceptionDetails: boolean;
  private exceptionMappings: Map<new (...args: any[]) => Error, number>;
  private rethrowExceptions: Array<new (...args: any[]) => Error>;
  private ignoreExceptions: Array<new (...args: any[]) => Error>;
  private customMappers: Map<new (...args: any[]) => Error, ExceptionMapperFunction>;
  
  // Fixed values that are no longer configurable
  private readonly exceptionDetailsPropertyName: string = 'exceptionDetails';
  private readonly validationProblemStatusCode: number = 422;

  constructor(options: ProblemDetailsConfigOptions = {}) {
    this.includeExceptionDetails = options.includeExceptionDetails ?? process.env.NODE_ENV !== 'production';
    this.exceptionMappings = options.exceptionMappings || new Map();
    this.rethrowExceptions = options.rethrowExceptions || [];
    this.ignoreExceptions = options.ignoreExceptions || [];
    this.customMappers = new Map();

    // Configure problem details with default mappings
    this.configureDefaultProblemDetails();
  }

  public configureDefaultProblemDetails(): this {
    // Map validation exceptions
    this.mapValidationException();
    
    // Map standard exceptions
    this.mapToStatusCode(NotFoundException, 404);
    this.mapToStatusCode(ForbiddenAccessException, 403);
    
    // Add more mappings for common exceptions
    this.mapToStatusCode<TypeError>(TypeError, 400);
    this.mapToStatusCode<RangeError>(RangeError, 400);
    
    // You can configure the middleware to re-throw certain types of exceptions.
    // This is useful if you have upstream middleware that needs to do additional handling of exceptions.
    // this.rethrow<NotSupportedError>(NotSupportedError);
    
    // You can configure the middleware to ignore any exceptions of the specified type.
    // This is useful if you have upstream middleware that needs to do additional handling of exceptions.
    // this.ignore<SomeSpecificError>(SomeSpecificError);
    
    // Because exceptions are handled polymorphically, this will act as a "catch all" mapping, which is why it's added last.
    // If an exception other than those mapped above is thrown, this will handle it.
    this.mapToStatusCode(Error, 500);
    
    return this;
  }

  /**
   * Map an exception type to a status code
   */
  public mapToStatusCode<T extends Error>(
    exceptionType: new (...args: any[]) => T,
    statusCode: number
  ): this {
    this.exceptionMappings.set(exceptionType, statusCode);
    return this;
  }

  /**
   * Map a custom exception handler for a specific exception type
   */
  public map<T extends Error>(
    exceptionType: new (...args: any[]) => T,
    mapper: ExceptionMapperFunction
  ): this {
    this.customMappers.set(exceptionType, mapper);
    return this;
  }

  /**
   * Configure the middleware to rethrow certain types of exceptions
   */
  public rethrow<T extends Error>(exceptionType: new (...args: any[]) => T): this {
    this.rethrowExceptions.push(exceptionType);
    return this;
  }

  /**
   * Configure the middleware to ignore certain types of exceptions
   */
  public ignore<T extends Error>(exceptionType: new (...args: any[]) => T): this {
    this.ignoreExceptions.push(exceptionType);
    return this;
  }

  /**
   * Map validation exceptions to appropriate problem details
   */
  private mapValidationException(): this {
    return this.map(ValidationException, (req, error) => {
      const validationError = error as ValidationException;
      return new ValidationProblemDetails(validationError.errors, {
        status: this.validationProblemStatusCode,
        title: 'Validation Failed',
        type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
        detail: error.message,
        instance: req.url
      });
    });
  }

  /**
   * Check if an exception should be rethrown
   */
  public shouldRethrow(error: Error): boolean {
    return this.rethrowExceptions.some(type => error instanceof type);
  }

  /**
   * Check if an exception should be ignored
   */
  public shouldIgnore(error: Error): boolean {
    return this.ignoreExceptions.some(type => error instanceof type);
  }

  /**
   * Get the status code for an exception
   */
  public getStatusCode(error: Error): number {
    for (const [exceptionType, statusCode] of this.exceptionMappings.entries()) {
      if (error instanceof exceptionType) {
        return statusCode;
      }
    }
    return 500;
  }

  /**
   * Create problem details for an exception
   */
  public createProblemDetails(error: Error, req: Request): ProblemDetails | null {
    // Check if the exception should be ignored
    if (this.shouldIgnore(error)) {
      return null;
    }

    // Check if the exception should be rethrown
    if (this.shouldRethrow(error)) {
      throw error;
    }

    // Check if there's a custom mapper for this exception type
    for (const [exceptionType, mapper] of this.customMappers.entries()) {
      if (error instanceof exceptionType) {
        const result = mapper(req, error);
        if (result) {
          return result;
        }
      }
    }

    // Get the status code for the exception
    const statusCode = this.getStatusCode(error);

    // Create problem details based on status code
    const problemDetails = new ProblemDetails({
      status: statusCode,
      title: this.getTitleForStatusCode(statusCode),
      type: this.getTypeForStatusCode(statusCode),
      detail: error.message,
      instance: req.url
    });

    // Include exception details if configured
    if (this.includeExceptionDetails) {
      problemDetails.withExceptionDetails(
        this.exceptionDetailsPropertyName,
        error,
        {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      );
    }

    return problemDetails;
  }

  /**
   * Get the title for a status code
   */
  private getTitleForStatusCode(statusCode: number): string {
    switch (statusCode) {
      case 400: return 'Bad Request';
      case 401: return 'Unauthorized';
      case 403: return 'Forbidden';
      case 404: return 'Not Found';
      case 405: return 'Method Not Allowed';
      case 409: return 'Conflict';
      case 422: return 'Unprocessable Entity';
      case 500: return 'Internal Server Error';
      case 501: return 'Not Implemented';
      case 503: return 'Service Unavailable';
      default: return `Status Code ${statusCode}`;
    }
  }

  private getTypeForStatusCode(statusCode: number): string {
    return ProblemDetailsConfig.getTypeForStatusCode(statusCode);
  }

  /**
   * Get the type URI for a status code
   */
  public static getTypeForStatusCode(statusCode: number): string {
    switch (statusCode) {
      case 400: return 'https://tools.ietf.org/html/rfc7231#section-6.5.1';
      case 401: return 'https://tools.ietf.org/html/rfc7235#section-3.1';
      case 403: return 'https://tools.ietf.org/html/rfc7231#section-6.5.3';
      case 404: return 'https://tools.ietf.org/html/rfc7231#section-6.5.4';
      case 405: return 'https://tools.ietf.org/html/rfc7231#section-6.5.5';
      case 409: return 'https://tools.ietf.org/html/rfc7231#section-6.5.8';
      case 422: return 'https://tools.ietf.org/html/rfc4918#section-11.2';
      case 500: return 'https://tools.ietf.org/html/rfc7231#section-6.6.1';
      case 501: return 'https://tools.ietf.org/html/rfc7231#section-6.6.2';
      case 503: return 'https://tools.ietf.org/html/rfc7231#section-6.6.4';
      default: return `https://httpstatuses.com/${statusCode}`;
    }
  }
}
