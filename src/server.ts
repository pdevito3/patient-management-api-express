import express from "express";
import { logger } from "~/utils/logger";
import "~/middleware/timestamp-logging";
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

app.get("/", (req, res) => {
  logger.info("Processing root request");
  res.send("Hello World!");
});

app.use("/api", apiRoutes);

app.get("/api/error", (req, res) => {
  logger.error("This is an example error");
  res.status(500).json({ message: "Internal server error" });
});

app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}`);
});
