import express, { Request, Response, NextFunction, Express, RequestHandler } from 'express';
import { logger } from '~/utils/logger';
import { ProblemDetailsConfig, ProblemDetailsConfigOptions } from './problem-details-config';
import { ProblemDetailsConfigurationExtension } from './problem-details-configuration-extension';
import { Application } from 'express-serve-static-core';
import { NotFoundException } from '~/exceptions/not-found-exception';

/**
 * Express middleware factory for problem details
 */
export class ProblemDetailsMiddleware {
  private config: ProblemDetailsConfig;

  constructor(options: ProblemDetailsConfigOptions = {}) {
    this.config = new ProblemDetailsConfig(options);
    
    // Configure the problem details with standard mappings
    ProblemDetailsConfigurationExtension.configureProblemDetails(this.config);
  }

  /**
   * Express middleware to handle exceptions and convert them to problem details
   */
  public handleUnknownErrorsAsProblemDetails() {
    return (err: Error, req: Request, res: Response, next: NextFunction) => {
      if (res.headersSent) {
        return next(err);
      }

      try {
        // Check if the exception should be ignored or rethrown
        if (this.config.shouldIgnore(err)) {
          return next(err);
        }

        if (this.config.shouldRethrow(err)) {
          return next(err);
        }

        const problemDetails = this.config.createProblemDetails(err, req);
        
        if (!problemDetails) {
          return next(err);
        }

        const status = problemDetails.status || 500;

        logger.error({ 
          err, 
          path: req.path, 
          method: req.method,
          status
        }, 'Request error');

        res.status(status).json(problemDetails);
      } catch (error) {
        // If something goes wrong in our error handling, log it and pass to default Express error handler
        logger.error({ error }, 'Error in problem details middleware');
        next(err);
      }
    };
  }

  public handleNotFoundAsProblemDetails() {
    return (req: Request, res: Response, next: NextFunction) => {
      // If we reach this middleware, no route has matched the request
      const notFoundError = new NotFoundException(`Route '${req.path}' not found`);
      
      const problemDetails = this.config.createProblemDetails(notFoundError, req);
      
      if (!problemDetails) {
        return next(notFoundError);
      }

      logger.warn({ 
        path: req.path, 
        method: req.method,
        status: 404
      }, 'Route not found');

      res.status(404).json(problemDetails);
    };
  }
}


/**
 * Extension methods for Express application
 */
declare module "express-serve-static-core" {
  interface Application {
    /**
     * Configure and use problem details middleware
     */
    useProblemDetailsMiddleware(options?: ProblemDetailsConfigOptions): Application;
  }
}

function attachProblemDetailsMiddleware(this: Application, options: ProblemDetailsConfigOptions = {}): Application {
  
  const middleware = new ProblemDetailsMiddleware(options);
  
  // Add error handling middleware for exceptions
  this.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    middleware.handleUnknownErrorsAsProblemDetails()(err, req, res, next);
  });
  this.use(middleware.handleNotFoundAsProblemDetails());
  
  return this;
}

(express.application as Application).useProblemDetailsMiddleware = attachProblemDetailsMiddleware;