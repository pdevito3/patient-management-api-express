export interface PatientForCreationDto {
  firstName: string;
  lastName: string;
  sex?: string;
}

export interface PatientForUpdateDto {
  firstName: string;
  lastName: string;
  sex?: string;
}

export interface PatientDto {
  id: string;
  firstName: string;
  lastName: string;
  sex: string;
}