import { Patient } from './patient';
import { PatientForCreation, PatientForUpdate } from './models';
import { Sex } from './sex';

/**
 * In-memory repository for patients
 */
export class PatientRepository {
  private static _patients: Map<string, Patient> = new Map();

  public getAll(): Patient[] {
    return Array.from(PatientRepository._patients.values());
  }

  public getById(id: string): Patient | undefined {
    return PatientRepository._patients.get(id);
  }

  public create(patientForCreation: PatientForCreation): Patient {
    const patient = Patient.create(patientForCreation);
    PatientRepository._patients.set(patient.id, patient);
    return patient;
  }

  public update(id: string, patientForUpdate: PatientForUpdate): Patient | undefined {
    const patient = this.getById(id);
    
    if (!patient) {
      return undefined;
    }
    
    const updatedPatient = patient.update(patientForUpdate);
    PatientRepository._patients.set(id, updatedPatient);
    
    return updatedPatient;
  }

  public delete(id: string): boolean {
    return PatientRepository._patients.delete(id);
  }

  public seed(): void {
    if (PatientRepository._patients.size === 0) {
      this.create({ firstName: 'John', lastName: 'Doe', sex: 'Male' });
      this.create({ firstName: 'Jane', lastName: 'Smith', sex: 'Female' });
    }
  }
}
