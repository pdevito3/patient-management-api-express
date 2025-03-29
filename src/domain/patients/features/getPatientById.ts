import { Request, Response } from "express";
import { logger } from "~/utils/logger";
import { PatientRepository } from "~/domain/patients/patient-repository";

export const getPatientById = async (req: Request, res: Response): Promise<void> => {
  try {
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
      res.status(404).json({ message: "Patient not found" });
    }
  } catch (error) {
    logger.error({ error, patientId: req.params.id }, "Error fetching patient");
    res.status(500).json({ message: "Failed to fetch patient" });
  }
};
