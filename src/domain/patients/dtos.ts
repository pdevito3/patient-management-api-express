export interface PatientForCreationDto {
  firstName: string;
  lastName: string;
  sex?: string;
  knownAge?: number | null;
  dateOfBirth?: string | null;
}

export interface PatientForUpdateDto {
  firstName: string;
  lastName: string;
  sex?: string;
  knownAge?: number | null;
  dateOfBirth?: string | null;
}

export interface PatientDto {
  id: string;
  firstName: string;
  lastName: string;
  sex: string;
  age: number | null;
  dateOfBirth: string | null;
  lifeStage: string;
}