import express, { NextFunction, Request, Response } from "express";
import { Application } from "express-serve-static-core";
import pinoHttp from "pino-http";
import { logger } from "../utils/logger";


declare module "express-serve-static-core" {
  interface Application {
    useHttpLoggingMiddleware(): this;
  }
  // interface Request {
  //   user?: string;
  // }
}

const httpLogger = pinoHttp({
  logger,
  customProps: (req: Request, res: Response) => {
    return {
      // user: req.user || 'anonymous',
      service: 'patient-management-api'
    };
  },
  customLogLevel: (req: Request, res: Response, error?: Error) => {
    if (res.statusCode >= 500 || error) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  customSuccessMessage: (req: Request, res: Response) => {
    return `${req.method} ${req.url} completed with ${res.statusCode}`;
  },
  customErrorMessage: (req: Request, res: Response, error: Error) => {
    return `${req.method} ${req.url} failed with ${res.statusCode}`;
  }
});

function attachHttpLogger(this: Application): Application {
  this.use(httpLogger);
  return this;
}

(express.application as Application).useHttpLoggingMiddleware =
  attachHttpLogger;
