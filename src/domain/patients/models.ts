export interface PatientForCreation {
  firstName: string;
  lastName: string;
  sex?: string;
}

export interface PatientForUpdate {
  firstName: string;
  lastName: string;
  sex?: string;
}
