import { Request, Response } from "express";
import { logger } from "~/utils/logger";
import { PatientRepository } from "~/domain/patients/patient-repository";
import { PatientDto } from "~/domain/patients/dtos";

/**
 * Core feature function that retrieves all patients
 * @returns Array of patient data
 */
export async function getAllPatientsFeature(): Promise<PatientDto[]> {
  logger.info("Fetching all patients");
  const patientRepository = new PatientRepository();
  const patients = await patientRepository.getAll();
  
  return patients.map(patient => ({
    id: patient.id,
    firstName: patient.firstName,
    lastName: patient.lastName,
    sex: patient.sex.Value,
    age: patient.lifespan.age,
    dateOfBirth: patient.lifespan.dateOfBirth ? patient.lifespan.dateOfBirth.toISOString() : null,
    lifeStage: patient.lifespan.getLifeStage()
  }));
}

export const getAllPatientsEndpoint = async (req: Request, res: Response): Promise<void> => {
  const patients = await getAllPatientsFeature();
  res.json(patients);
};
