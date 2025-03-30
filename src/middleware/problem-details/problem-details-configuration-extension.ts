import { Request } from 'express';
import { ValidationException } from '~/exceptions/validation-exception';
import { NotFoundException } from '~/exceptions/not-found-exception';
import { ForbiddenAccessException } from '~/exceptions/forbidden-access-exception';
import { ProblemDetails, ValidationProblemDetails } from '~/exceptions/problem-details';
import { ProblemDetailsConfig } from './problem-details-config';

// Define interfaces for errors with additional properties
interface NetworkError extends Error {
  code: string;
}

interface AuthError extends Error {
  code: string;
}

/**
 * Extension methods for ProblemDetailsConfig
 */
export class ProblemDetailsConfigurationExtension {
  /**
   * Configure problem details with standard mappings
   */
  public static configureProblemDetails(config: ProblemDetailsConfig): ProblemDetailsConfig {
    // Map validation exceptions
    config.map(ValidationException, ProblemDetailsConfigurationExtension.mapValidationException);
    
    // Map standard exceptions to status codes
    config.mapToStatusCode(NotFoundException, 404);
    config.mapToStatusCode(ForbiddenAccessException, 403);
    
    // Add more mappings for common exceptions
    config.mapToStatusCode<TypeError>(TypeError, 400);
    config.mapToStatusCode<RangeError>(RangeError, 400);
    
    // Because exceptions are handled polymorphically, this will act as a "catch all" mapping, which is why it's added last.
    // If an exception other than those mapped above is thrown, this will handle it.
    config.mapToStatusCode<Error>(Error, 500);
    
    return config;
  }
  
  /**
   * Map validation exception to problem details
   */
  private static mapValidationException(req: Request, error: Error): ProblemDetails | null {
    const validationError = error as ValidationException;
    return new ValidationProblemDetails(validationError.errors, {
      status: 422,
      title: 'Validation Failed',
      type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
      detail: error.message,
      instance: req.url
    });
  }
}
