import { Request, Response } from "express";
import { logger } from "~/utils/logger";
import { PatientRepository } from "~/domain/patients/patient-repository";
import { PatientForCreationDto, PatientDto } from "~/domain/patients/dtos";
import { PatientForCreation } from "~/domain/patients/models";
import { Patient } from "~/domain/patients/patient";

/**
 * Core feature function that creates a patient from DTO
 * @param patientDto The patient data for creation
 * @returns The created patient data
 */
export async function createPatientFeature(patientDto: PatientForCreationDto): Promise<PatientDto> {
  logger.info({ patient: patientDto }, "Creating new patient");

  const patientForCreation: PatientForCreation = {
    firstName: patientDto.firstName,
    lastName: patientDto.lastName,
    sex: patientDto.sex,
    knownAge: patientDto.knownAge,
    dateOfBirth: patientDto.dateOfBirth
  };
  
  const patientRepository = new PatientRepository();
  const newPatient = await patientRepository.create(patientForCreation);
  
  return {
    id: newPatient.id,
    firstName: newPatient.firstName,
    lastName: newPatient.lastName,
    sex: newPatient.sex.Value,
    age: newPatient.lifespan.age,
    dateOfBirth: newPatient.lifespan.dateOfBirth ? newPatient.lifespan.dateOfBirth.toISOString() : null,
    lifeStage: newPatient.lifespan.getLifeStage()
  };
}

export const createPatientEndpoint = async (req: Request, res: Response): Promise<void> => {
  const patientDto: PatientForCreationDto = req.body;
  const newPatient = await createPatientFeature(patientDto);
  res.status(201).json(newPatient);
};
