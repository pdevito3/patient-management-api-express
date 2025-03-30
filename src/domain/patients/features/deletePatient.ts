import { Request, Response } from "express";
import { logger } from "~/utils/logger";
import { PatientRepository } from "~/domain/patients/patient-repository";
import { NotFoundException } from "~/exceptions/not-found-exception";

/**
 * Core feature function that deletes a patient
 * @param patientId The ID of the patient to delete
 * @returns True if the patient was deleted successfully
 * @throws NotFoundException if the patient is not found
 */
export async function deletePatientFeature(patientId: string): Promise<boolean> {
  logger.info({ patientId }, "Deleting patient");
  
  const patientRepository = new PatientRepository();
  const deleted = await patientRepository.delete(patientId);
  
  if (deleted) {
    return true;
  } else {
    logger.warn({ patientId }, "Patient not found for deletion");
    throw new NotFoundException("Patient", patientId);
  }
}

export const deletePatientEndpoint = async (req: Request, res: Response): Promise<void> => {
  const patientId = req.params.id;
  await deletePatientFeature(patientId);
  res.status(204).send();
};
