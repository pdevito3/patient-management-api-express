import { Request, Response } from "express";
import { logger } from "~/utils/logger";
import { PatientRepository } from "~/domain/patients/patient-repository";
import { NotFoundException } from "~/exceptions/not-found-exception";

export const getPatientById = async (req: Request, res: Response): Promise<void> => {
  const patientId = req.params.id;
  logger.info({ patientId }, "Fetching patient by ID");
  
  const patientRepository = new PatientRepository();
  const patient = await patientRepository.getById(patientId);
  
  if (patient) {
    res.json({
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      sex: patient.sex.Value,
      age: patient.lifespan.age,
      dateOfBirth: patient.lifespan.dateOfBirth,
      lifeStage: patient.lifespan.getLifeStage()
    });
  } else {
    logger.warn({ patientId }, "Patient not found");
    throw new NotFoundException("Patient", patientId);
  }
};
