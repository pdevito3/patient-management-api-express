import express from "express";
import { logger } from "./utils/logger";
import "./middleware/timestamp-logging";

const app = express();
const port: number = 3448;

app.useHttpLoggingMiddleware();

app.use(express.json());

app.get("/", (req, res) => {
  logger.info("Processing root request");
  res.send("Hello World!");
});

app.get("/api/patients", (req, res) => {
  logger.info("Fetching all patients");
  res.json({
    success: true,
    data: [
      { id: 1, name: "John Doe", age: 45 },
      { id: 2, name: "Jane Smith", age: 32 }
    ]
  });
});

app.get("/api/patients/:id", (req, res) => {
  const patientId = req.params.id;
  logger.info({ patientId }, "Fetching patient by ID");
  
  if (patientId === "1") {
    res.json({
      success: true,
      data: { id: 1, name: "John Doe", age: 45 }
    });
  } else if (patientId === "2") {
    res.json({
      success: true,
      data: { id: 2, name: "Jane Smith", age: 32 }
    });
  } else {
    logger.warn({ patientId }, "Patient not found");
    res.status(404).json({
      success: false,
      error: "Patient not found"
    });
  }
});

app.get("/api/error", (req, res) => {
  logger.error("This is an example error");
  res.status(500).json({
    success: false,
    error: "Internal server error"
  });
});

app.listen(port, () => {
  logger.info(`Patient Management API listening on port ${port}`);
});
