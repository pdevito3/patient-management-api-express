import express, { Request, Response, NextFunction } from "express";
import "express-async-errors";
import { logger } from "~/utils/logger";
import "~/middleware/timestamp-logging";
import "~/middleware/problem-details/problem-details-middleware";
import { PatientRepository } from "~/domain/patients/patient-repository";
import { initializeDatabase } from "~/config/database";
import apiRoutes from "~/routes";

const app = express();
const port: number = 3448;
const patientRepository = new PatientRepository();

(async () => {
  try {
    await initializeDatabase();
    await patientRepository.seed();
    logger.info("Database initialized and seeded successfully");
  } catch (error) {
    logger.error({ error }, "Failed to initialize database");
  }
})();

app.useHttpLoggingMiddleware();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  logger.info("Processing root request");
  res.send("Hello World!");
});

app.use("/api", apiRoutes);
app.get("/api/error", (req: Request, res: Response, next: NextFunction) => {
  next(new Error("This is an example error"));
});

app.useProblemDetailsMiddleware({
  includeExceptionDetails: process.env.NODE_ENV !== 'production'
});

app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}`);
});
