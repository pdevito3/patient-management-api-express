import { Request, Response } from "express";
import { logger } from "../../../utils/logger";
import { PatientRepository } from "../patient-repository";

export const deletePatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const patientId = req.params.id;
    logger.info({ patientId }, "Deleting patient");
    
    const patientRepository = new PatientRepository();
    const deleted = await patientRepository.delete(patientId);
    
    if (deleted) {
      res.status(204).send();
    } else {
      logger.warn({ patientId }, "Patient not found for deletion");
      res.status(404).json({ message: "Patient not found" });
    }
  } catch (error) {
    logger.error({ error, patientId: req.params.id }, "Error deleting patient");
    res.status(500).json({ message: "Failed to delete patient" });
  }
};
