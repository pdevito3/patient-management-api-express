import { BaseEntity } from '../base-entity';
import { PatientForCreation, PatientForUpdate } from './models';
import { Sex } from '../sexes/sex';
import { Lifespan } from '../lifespans/lifespan';

/**
 * Patient entity that represents a patient in the system
 */
export class Patient extends BaseEntity {
  private _firstName: string = '';
  private _lastName: string = '';
  private _sex: Sex = Sex.NotGiven();
  private _lifespan: Lifespan = new Lifespan();

  public get firstName(): string {
    return this._firstName;
  }
  private set firstName(value: string) {
    this._firstName = value;
  }

  public get lastName(): string {
    return this._lastName;
  }
  private set lastName(value: string) {
    this._lastName = value;
  }

  public get sex(): Sex {
    return this._sex;
  }
  private set sex(value: Sex) {
    this._sex = value;
  }

  public get lifespan(): Lifespan {
    return this._lifespan;
  }
  private set lifespan(value: Lifespan) {
    this._lifespan = value;
  }

  /**
   * Creates a new patient from the provided data
   * @param patientForCreation The data to create the patient from
   * @returns A new patient instance
   */
  public static create(patientForCreation: PatientForCreation): Patient {
    const newPatient = new Patient();
    
    newPatient.firstName = patientForCreation.firstName;
    newPatient.lastName = patientForCreation.lastName;
    newPatient.sex = new Sex(patientForCreation.sex);
    newPatient.lifespan = new Lifespan(patientForCreation.knownAge, patientForCreation.dateOfBirth);
    
    return newPatient;
  }

  /**
   * Updates the patient with the provided data
   * @param patientForUpdate The data to update the patient with
   * @returns The updated patient instance
   */
  public update(patientForUpdate: PatientForUpdate): Patient {
    this.firstName = patientForUpdate.firstName;
    this.lastName = patientForUpdate.lastName;
    this.sex = new Sex(patientForUpdate.sex);
    this.lifespan = new Lifespan(patientForUpdate.knownAge, patientForUpdate.dateOfBirth);
    
    return this;
  }
}
