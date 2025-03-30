import { Request, Response } from "express";
import { logger } from "~/utils/logger";
import { PatientRepository } from "~/domain/patients/patient-repository";

export const getAllPatients = async (req: Request, res: Response): Promise<void> => {
  logger.info("Fetching all patients");
  const patientRepository = new PatientRepository();
  const patients = await patientRepository.getAll();
  
  res.json(patients.map(patient => ({
    id: patient.id,
    firstName: patient.firstName,
    lastName: patient.lastName,
    sex: patient.sex.Value,
    age: patient.lifespan.age,
    dateOfBirth: patient.lifespan.dateOfBirth,
    lifeStage: patient.lifespan.getLifeStage()
  })));
};
