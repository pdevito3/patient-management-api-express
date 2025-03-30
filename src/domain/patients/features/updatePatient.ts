import { Request, Response } from "express";
import { logger } from "~/utils/logger";
import { PatientRepository } from "~/domain/patients/patient-repository";
import { PatientForUpdateDto, PatientDto } from "~/domain/patients/dtos";
import { PatientForUpdate } from "~/domain/patients/models";
import { NotFoundException } from "~/exceptions/not-found-exception";
import { ValidationException } from "~/exceptions/validation-exception";

/**
 * Core feature function that updates a patient
 * @param patientId The ID of the patient to update
 * @param patientDto The patient data for update
 * @returns The updated patient data
 * @throws NotFoundException if the patient is not found
 */
export async function updatePatientFeature(patientId: string, patientDto: PatientForUpdateDto): Promise<PatientDto> {
  logger.info({ patientId, patient: patientDto }, "Updating patient");
  
  const patientForUpdate: PatientForUpdate = {
    firstName: patientDto.firstName,
    lastName: patientDto.lastName,
    sex: patientDto.sex,
    knownAge: patientDto.knownAge,
    dateOfBirth: patientDto.dateOfBirth
  };
  
  const patientRepository = new PatientRepository();
  const updatedPatient = await patientRepository.update(patientId, patientForUpdate);
  
  if (updatedPatient) {
    return {
      id: updatedPatient.id,
      firstName: updatedPatient.firstName,
      lastName: updatedPatient.lastName,
      sex: updatedPatient.sex.Value,
      age: updatedPatient.lifespan.age,
      dateOfBirth: updatedPatient.lifespan.dateOfBirth ? updatedPatient.lifespan.dateOfBirth.toISOString() : null,
      lifeStage: updatedPatient.lifespan.getLifeStage()
    };
  } else {
    logger.warn({ patientId }, "Patient not found for update");
    throw new NotFoundException("Patient", patientId);
  }
}

export const updatePatientEndpoint = async (req: Request, res: Response): Promise<void> => {
  const patientId = req.params.id;
  const patientDto: PatientForUpdateDto = req.body;
  const updatedPatient = await updatePatientFeature(patientId, patientDto);
  res.json(updatedPatient);
};
