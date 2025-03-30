import { Request, Response } from "express";
import { logger } from "~/utils/logger";
import { PatientRepository } from "~/domain/patients/patient-repository";
import { NotFoundException } from "~/exceptions/not-found-exception";

export const deletePatient = async (req: Request, res: Response): Promise<void> => {
  const patientId = req.params.id;
  logger.info({ patientId }, "Deleting patient");
  
  const patientRepository = new PatientRepository();
  const deleted = await patientRepository.delete(patientId);
  
  if (deleted) {
    res.status(204).send();
  } else {
    logger.warn({ patientId }, "Patient not found for deletion");
    throw new NotFoundException("Patient", patientId);
  }
};
