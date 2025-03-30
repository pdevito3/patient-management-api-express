import { Request, Response } from "express";
import { logger } from "~/utils/logger";
import { PatientRepository } from "~/domain/patients/patient-repository";
import { NotFoundException } from "~/exceptions/not-found-exception";
import { PatientDto } from "~/domain/patients/dtos";

/**
 * Core feature function that retrieves a patient by ID
 * @param patientId The ID of the patient to retrieve
 * @returns The patient data
 * @throws NotFoundException if the patient is not found
 */
export async function getPatientByIdFeature(patientId: string): Promise<PatientDto> {
  logger.info({ patientId }, "Fetching patient by ID");
  
  const patientRepository = new PatientRepository();
  const patient = await patientRepository.getById(patientId);
  
  if (patient) {
    return {
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      sex: patient.sex.Value,
      age: patient.lifespan.age,
      dateOfBirth: patient.lifespan.dateOfBirth ? patient.lifespan.dateOfBirth.toISOString() : null,
      lifeStage: patient.lifespan.getLifeStage()
    };
  } else {
    logger.warn({ patientId }, "Patient not found");
    throw new NotFoundException("Patient", patientId);
  }
}

export const getPatientByIdEndpoint = async (req: Request, res: Response): Promise<void> => {
  const patientId = req.params.id;
  const patient = await getPatientByIdFeature(patientId);
  res.json(patient);
};
