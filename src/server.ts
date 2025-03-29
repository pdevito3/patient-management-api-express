import express from "express";
import { logger } from "./utils/logger";
import "./middleware/timestamp-logging";
import { PatientRepository } from "./domain/patients/patient-repository";
import { PatientForCreationDto, PatientForUpdateDto } from "./domain/patients/dtos";
import { PatientForCreation, PatientForUpdate } from "./domain/patients/models";
import { initializeDatabase } from "./config/database";

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

app.get("/api/patients", async (req, res) => {
  try {
    logger.info("Fetching all patients");
    const patients = await patientRepository.getAll();
    
    res.json({
      success: true,
      data: patients.map(patient => ({
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        sex: patient.sex.Value,
        age: patient.lifespan.age,
        dateOfBirth: patient.lifespan.dateOfBirth,
        lifeStage: patient.lifespan.getLifeStage()
      }))
    });
  } catch (error) {
    logger.error({ error }, "Error fetching patients");
    res.status(500).json({
      success: false,
      error: "Failed to fetch patients"
    });
  }
});

app.get("/api/patients/:id", async (req, res) => {
  try {
    const patientId = req.params.id;
    logger.info({ patientId }, "Fetching patient by ID");
    
    const patient = await patientRepository.getById(patientId);
    
    if (patient) {
      res.json({
        success: true,
        data: {
          id: patient.id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          sex: patient.sex.Value,
          age: patient.lifespan.age,
          dateOfBirth: patient.lifespan.dateOfBirth,
          lifeStage: patient.lifespan.getLifeStage()
        }
      });
    } else {
      logger.warn({ patientId }, "Patient not found");
      res.status(404).json({
        success: false,
        error: "Patient not found"
      });
    }
  } catch (error) {
    logger.error({ error, patientId: req.params.id }, "Error fetching patient");
    res.status(500).json({
      success: false,
      error: "Failed to fetch patient"
    });
  }
});

app.post("/api/patients", async (req, res) => {
  try {
    const patientDto: PatientForCreationDto = req.body;
    logger.info({ patient: patientDto }, "Creating new patient");
    
    const patientForCreation: PatientForCreation = {
      firstName: patientDto.firstName,
      lastName: patientDto.lastName,
      sex: patientDto.sex,
      knownAge: patientDto.knownAge,
      dateOfBirth: patientDto.dateOfBirth
    };
    
    const newPatient = await patientRepository.create(patientForCreation);
    
    res.status(201).json({
      success: true,
      data: {
        id: newPatient.id,
        firstName: newPatient.firstName,
        lastName: newPatient.lastName,
        sex: newPatient.sex.Value,
        age: newPatient.lifespan.age,
        dateOfBirth: newPatient.lifespan.dateOfBirth,
        lifeStage: newPatient.lifespan.getLifeStage()
      }
    });
  } catch (error) {
    logger.error({ error }, "Error creating patient");
    res.status(400).json({
      success: false,
      error: "Invalid patient data"
    });
  }
});

app.put("/api/patients/:id", async (req, res) => {
  try {
    const patientId = req.params.id;
    const patientDto: PatientForUpdateDto = req.body;
    logger.info({ patientId, patient: patientDto }, "Updating patient");
    
    const patientForUpdate: PatientForUpdate = {
      firstName: patientDto.firstName,
      lastName: patientDto.lastName,
      sex: patientDto.sex,
      knownAge: patientDto.knownAge,
      dateOfBirth: patientDto.dateOfBirth
    };
    
    const updatedPatient = await patientRepository.update(patientId, patientForUpdate);
    
    if (updatedPatient) {
      res.json({
        success: true,
        data: {
          id: updatedPatient.id,
          firstName: updatedPatient.firstName,
          lastName: updatedPatient.lastName,
          sex: updatedPatient.sex.Value,
          age: updatedPatient.lifespan.age,
          dateOfBirth: updatedPatient.lifespan.dateOfBirth,
          lifeStage: updatedPatient.lifespan.getLifeStage()
        }
      });
    } else {
      logger.warn({ patientId }, "Patient not found for update");
      res.status(404).json({
        success: false,
        error: "Patient not found"
      });
    }
  } catch (error) {
    logger.error({ error }, "Error updating patient");
    res.status(400).json({
      success: false,
      error: "Invalid patient data"
    });
  }
});

app.delete("/api/patients/:id", async (req, res) => {
  try {
    const patientId = req.params.id;
    logger.info({ patientId }, "Deleting patient");
    
    const deleted = await patientRepository.delete(patientId);
    
    if (deleted) {
      res.status(204).send();
    } else {
      logger.warn({ patientId }, "Patient not found for deletion");
      res.status(404).json({
        success: false,
        error: "Patient not found"
      });
    }
  } catch (error) {
    logger.error({ error, patientId: req.params.id }, "Error deleting patient");
    res.status(500).json({
      success: false,
      error: "Failed to delete patient"
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
  logger.info(`Server is running on port ${port}`);
});
