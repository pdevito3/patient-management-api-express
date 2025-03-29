import { Patient } from '~/domain/patients/patient';
import { PatientForCreation, PatientForUpdate } from '~/domain/patients/models';
import { Sex } from '~/domain/sexes/sex';
import { Lifespan } from '~/domain/lifespans/lifespan';
import { db } from '~/config/database';

export class PatientRepository {
  public async getAll(): Promise<Patient[]> {
    const patientRecords = await db('patients').select('*');
    return patientRecords.map(this.mapToPatient);
  }

  public async getById(id: string): Promise<Patient | undefined> {
    const patientRecord = await db('patients').where({ id }).first();
    return patientRecord ? this.mapToPatient(patientRecord) : undefined;
  }

  public async create(patientForCreation: PatientForCreation): Promise<Patient> {
    const patient = Patient.create(patientForCreation);
    
    await db('patients').insert({
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      sex: patient.sex.Value,
      knownAge: patient.lifespan.knownAge,
      dateOfBirth: patient.lifespan.dateOfBirth ? patient.lifespan.dateOfBirth.toISOString() : null
    });
    
    return patient;
  }

  public async update(id: string, patientForUpdate: PatientForUpdate): Promise<Patient | undefined> {
    const patient = await this.getById(id);
    
    if (!patient) {
      return undefined;
    }
    
    const updatedPatient = patient.update(patientForUpdate);
    
    await db('patients')
      .where({ id })
      .update({
        firstName: updatedPatient.firstName,
        lastName: updatedPatient.lastName,
        sex: updatedPatient.sex.Value,
        knownAge: updatedPatient.lifespan.knownAge,
        dateOfBirth: updatedPatient.lifespan.dateOfBirth ? updatedPatient.lifespan.dateOfBirth.toISOString() : null
      });
    
    return updatedPatient;
  }

  public async delete(id: string): Promise<boolean> {
    const deletedCount = await db('patients').where({ id }).delete();
    return deletedCount > 0;
  }

  public async seed(): Promise<void> {
    const count = await db('patients').count('* as count').first();
    
    if (count && (count.count as number) === 0) {
      await this.create({ firstName: 'John', lastName: 'Doe', sex: 'Male', dateOfBirth: '1985-06-15' });
      await this.create({ firstName: 'Jane', lastName: 'Smith', sex: 'Female', knownAge: 42 });
    }
  }

  private mapToPatient(record: any): Patient {
    const patient = new Patient();
    Object.defineProperty(patient, '_id', { value: record.id });
    Object.defineProperty(patient, '_firstName', { value: record.firstName });
    Object.defineProperty(patient, '_lastName', { value: record.lastName });
    Object.defineProperty(patient, '_sex', { value: new Sex(record.sex) });
    
    // Map lifespan data
    let lifespan: Lifespan;
    if (record.dateOfBirth) {
      lifespan = new Lifespan(null, new Date(record.dateOfBirth));
    } else if (record.knownAge !== null && record.knownAge !== undefined) {
      lifespan = new Lifespan(record.knownAge);
    } else {
      lifespan = new Lifespan();
    }
    
    Object.defineProperty(patient, '_lifespan', { value: lifespan });
    
    return patient;
  }
}
