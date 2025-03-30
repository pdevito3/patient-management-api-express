import { Request, Response } from "express";
import { logger } from "~/utils/logger";
import { PatientRepository } from "~/domain/patients/patient-repository";
import { PatientForUpdateDto } from "~/domain/patients/dtos";
import { PatientForUpdate } from "~/domain/patients/models";
import { NotFoundException } from "~/exceptions/not-found-exception";
import { ValidationException } from "~/exceptions/validation-exception";

export const updatePatient = async (req: Request, res: Response): Promise<void> => {
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
  
  const patientRepository = new PatientRepository();
  const updatedPatient = await patientRepository.update(patientId, patientForUpdate);
  
  if (updatedPatient) {
    res.json({
      id: updatedPatient.id,
      firstName: updatedPatient.firstName,
      lastName: updatedPatient.lastName,
      sex: updatedPatient.sex.Value,
      age: updatedPatient.lifespan.age,
      dateOfBirth: updatedPatient.lifespan.dateOfBirth,
      lifeStage: updatedPatient.lifespan.getLifeStage()
    });
  } else {
    logger.warn({ patientId }, "Patient not found for update");
    throw new NotFoundException("Patient", patientId);
  }
};
