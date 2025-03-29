import { Request, Response } from "express";
import { logger } from "../../../utils/logger";
import { PatientRepository } from "../patient-repository";

export const getAllPatients = async (req: Request, res: Response): Promise<void> => {
  try {
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
  } catch (error) {
    logger.error({ error }, "Error fetching patients");
    res.status(500).json({ message: "Failed to fetch patients" });
  }
};
