import { ProblemDetailsConfig } from "~/middleware/problem-details/problem-details-config";

/**
 * Base problem details class following RFC 7807 standard
 * https://tools.ietf.org/html/rfc7807
 */
export interface ProblemDetailsOptions {
  status?: number;
  title?: string;
  type?: string;
  detail?: string;
  instance?: string;
  extensions?: Record<string, unknown>;
}

export class ProblemDetails {
  status?: number;
  title?: string;
  type?: string;
  detail?: string;
  instance?: string;
  [key: string]: unknown;

  constructor(options: ProblemDetailsOptions = {}) {
    this.status = options.status;
    this.title = options.title;
    this.type = options.type;
    this.detail = options.detail;
    this.instance = options.instance;

    if (options.extensions) {
      Object.entries(options.extensions).forEach(([key, value]) => {
        this[key] = value;
      });
    }
  }

  withExceptionDetails(propertyName: string, error: Error, details?: Record<string, unknown>): this {
    this[propertyName] = {
      message: error.message,
      stack: error.stack,
      ...(details || {})
    };
    return this;
  }
}

export class ValidationProblemDetails extends ProblemDetails {
  errors: Record<string, string[]>;

  constructor(errors: Record<string, string[]>, options: ProblemDetailsOptions = {}) {
    const defaultCode = 422;
    super({
      status: options.status || defaultCode,
      title: options.title || 'Validation Failed',
      type: options.type || ProblemDetailsConfig.getTypeForStatusCode(defaultCode),
      ...options
    });
    this.errors = errors;
  }
}
