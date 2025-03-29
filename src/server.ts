import express from "express";
import { logger } from "./utils/logger";
import "./middleware/timestamp-logging";
import { PatientRepository } from "./domain/patients/patient-repository";
import { PatientForCreationDto, PatientForUpdateDto } from "./domain/patients/dtos";
import { PatientForCreation, PatientForUpdate } from "./domain/patients/models";

const app = express();
const port: number = 3448;
const patientRepository = new PatientRepository();

// Seed initial data
patientRepository.seed();

app.useHttpLoggingMiddleware();

app.use(express.json());

app.get("/", (req, res) => {
  logger.info("Processing root request");
  res.send("Hello World!");
});

// Get all patients
app.get("/api/patients", (req, res) => {
  logger.info("Fetching all patients");
  const patients = patientRepository.getAll();
  
  res.json({
    success: true,
    data: patients.map(patient => ({
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      sex: patient.sex.Value
    }))
  });
});

// Get patient by ID
app.get("/api/patients/:id", (req, res) => {
  const patientId = req.params.id;
  logger.info({ patientId }, "Fetching patient by ID");
  
  const patient = patientRepository.getById(patientId);
  
  if (patient) {
    res.json({
      success: true,
      data: {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        sex: patient.sex.Value
      }
    });
  } else {
    logger.warn({ patientId }, "Patient not found");
    res.status(404).json({
      success: false,
      error: "Patient not found"
    });
  }
});

// Create a new patient
app.post("/api/patients", (req, res) => {
  try {
    const patientDto: PatientForCreationDto = req.body;
    logger.info({ patient: patientDto }, "Creating new patient");
    
    const patientForCreation: PatientForCreation = {
      firstName: patientDto.firstName,
      lastName: patientDto.lastName,
      sex: patientDto.sex
    };
    
    const newPatient = patientRepository.create(patientForCreation);
    
    res.status(201).json({
      success: true,
      data: {
        id: newPatient.id,
        firstName: newPatient.firstName,
        lastName: newPatient.lastName,
        sex: newPatient.sex.Value
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

// Update an existing patient
app.put("/api/patients/:id", (req, res) => {
  try {
    const patientId = req.params.id;
    const patientDto: PatientForUpdateDto = req.body;
    logger.info({ patientId, patient: patientDto }, "Updating patient");
    
    const patientForUpdate: PatientForUpdate = {
      firstName: patientDto.firstName,
      lastName: patientDto.lastName,
      sex: patientDto.sex
    };
    
    const updatedPatient = patientRepository.update(patientId, patientForUpdate);
    
    if (updatedPatient) {
      res.json({
        success: true,
        data: {
          id: updatedPatient.id,
          firstName: updatedPatient.firstName,
          lastName: updatedPatient.lastName,
          sex: updatedPatient.sex.Value
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

// Delete a patient
app.delete("/api/patients/:id", (req, res) => {
  const patientId = req.params.id;
  logger.info({ patientId }, "Deleting patient");
  
  const deleted = patientRepository.delete(patientId);
  
  if (deleted) {
    res.status(204).send();
  } else {
    logger.warn({ patientId }, "Patient not found for deletion");
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
