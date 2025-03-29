export interface PatientForCreation {
  firstName: string;
  lastName: string;
  sex?: string;
  knownAge?: number | null;
  dateOfBirth?: Date | string | null;
}

export interface PatientForUpdate {
  firstName: string;
  lastName: string;
  sex?: string;
  knownAge?: number | null;
  dateOfBirth?: Date | string | null;
}
