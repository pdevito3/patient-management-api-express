import { Request, Response } from "express";
import { logger } from "~/utils/logger";
import { PatientRepository } from "~/domain/patients/patient-repository";
import { PatientForCreationDto } from "~/domain/patients/dtos";
import { PatientForCreation } from "~/domain/patients/models";

export const createPatient = async (req: Request, res: Response): Promise<void> => {
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
    
    const patientRepository = new PatientRepository();
    const newPatient = await patientRepository.create(patientForCreation);
    
    res.status(201).json({
      id: newPatient.id,
      firstName: newPatient.firstName,
      lastName: newPatient.lastName,
      sex: newPatient.sex.Value,
      age: newPatient.lifespan.age,
      dateOfBirth: newPatient.lifespan.dateOfBirth,
      lifeStage: newPatient.lifespan.getLifeStage()
    });
  } catch (error) {
    logger.error({ error }, "Error creating patient");
    res.status(400).json({ message: "Invalid patient data" });
  }
};
