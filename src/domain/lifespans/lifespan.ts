import { ValueObject } from '~/domain/value-object';
import { ValidationException } from '~/exceptions';

/**
 * Represents a person's lifespan, either by known age or date of birth
 */
export class Lifespan extends ValueObject {
  private _knownAge: number | null = null;
  private _dateOfBirth: Date | null = null;

  public get knownAge(): number | null {
    return this._knownAge;
  }

  public get dateOfBirth(): Date | null {
    return this._dateOfBirth;
  }

  /**
   * Gets the age in years, calculated from either known age or date of birth
   */
  public get age(): number | null {
    if (this._knownAge !== null) {
      return this._knownAge;
    }

    if (this._dateOfBirth !== null) {
      return this.getAgeInYears(this._dateOfBirth);
    }

    return null;
  }

  /**
   * Creates a new Lifespan instance
   * @param knownAge Optional known age in years
   * @param dateOfBirth Optional date of birth
   */
  constructor(knownAge?: number | string | null, dateOfBirth?: Date | string | null) {
    super();
    
    this._knownAge = null;
    this._dateOfBirth = null;
    
    const hasAge = knownAge !== undefined && knownAge !== null;
    const hasDob = dateOfBirth !== undefined && dateOfBirth !== null;
    
    if (hasAge && !hasDob) {
      const age = typeof knownAge === 'string' ? parseInt(knownAge, 10) : knownAge as number;
      if (!isNaN(age)) {
        this.createLifespanFromKnownAge(age);
      }
    }
    
    if (hasDob) {
      const dob = typeof dateOfBirth === 'string' 
        ? new Date(dateOfBirth as string) 
        : dateOfBirth as Date;
      
      if (dob instanceof Date && !isNaN(dob.getTime())) {
        this.createLifespanFromDateOfBirth(dob);
      }
    }
  }

  /**
   * Gets the age in days, calculated from date of birth
   * @returns Age in days or null if date of birth is not set
   */
  public getAgeInDays(): number | null {
    if (this._dateOfBirth !== null) {
      return this.calculateAgeInDays(this._dateOfBirth);
    }
    
    return null;
  }

  /**
   * Creates a Lifespan from a known age
   * @param ageInYears Age in years
   * @returns A new Lifespan instance
   */
  public static fromKnownAge(ageInYears: number): Lifespan {
    return new Lifespan(ageInYears);
  }

  /**
   * Creates a Lifespan from a date of birth
   * @param dob Date of birth
   * @returns A new Lifespan instance
   */
  public static fromDateOfBirth(dob: Date): Lifespan {
    return new Lifespan(null, dob);
  }

  /**
   * Gets a PHI-friendly string representation of the age
   * @returns A string representing the age in a PHI-friendly format
   */
  public getPhiFriendlyString(): string {
    const age = this.age;
    
    if (age === null) {
      return 'Unknown';
    }
    
    if (age < 1) {
      return '< 1 year';
    }
    
    if (age > 89) {
      return '> 89 years';
    }
    
    return `${age} years`;
  }

  /**
   * Gets the life stage for the person
   * @returns A string representing the life stage
   */
  public getLifeStage(): string {
    const age = this.age;
    
    if (age === null) {
      return 'Unknown';
    }
    
    if (age < 1) {
      return 'Infant';
    }
    
    if (age < 3) {
      return 'Toddler';
    }
    
    if (age < 13) {
      return 'Child';
    }
    
    if (age < 18) {
      return 'Adolescent';
    }
    
    if (age < 65) {
      return 'Adult';
    }
    
    return 'Senior';
  }

  /**
   * Creates a lifespan from a known age
   * @param ageInYears Age in years
   */
  private createLifespanFromKnownAge(ageInYears: number): void {
    if (ageInYears < 0) {
      throw new ValidationException('Lifespan', 'Age cannot be less than zero years.');
    }
    
    if (ageInYears > 120) {
      throw new ValidationException('Lifespan', 'Age cannot be more than 120 years.');
    }
    
    this._knownAge = ageInYears;
    this._dateOfBirth = null;
  }

  /**
   * Creates a lifespan from a date of birth
   * @param dob Date of birth
   */
  private createLifespanFromDateOfBirth(dob: Date): void {
    if (dob > new Date()) {
      throw new ValidationException('Lifespan', 'Date of birth must be in the past');
    }
    
    this._dateOfBirth = dob;
    this._knownAge = null;
  }

  /**
   * Calculates age in days from a date of birth
   * @param dob Date of birth
   * @returns Age in days
   */
  private calculateAgeInDays(dob: Date): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    const dobUtc = new Date(Date.UTC(dob.getFullYear(), dob.getMonth(), dob.getDate()));
    const now = new Date();
    const diffMs = now.getTime() - dobUtc.getTime();
    return Math.floor(diffMs / msPerDay);
  }

  /**
   * Calculates age in years from a date of birth
   * @param dob Date of birth
   * @returns Age in years
   */
  private getAgeInYears(dob: Date): number {
    const now = new Date();
    let ageInYears = now.getFullYear() - dob.getFullYear();
    
    // Adjust age if birthday hasn't occurred yet this year
    const birthdayThisYear = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
    if (birthdayThisYear > now) {
      ageInYears--;
    }
    
    return ageInYears;
  }

  /**
   * Returns a string representation of the lifespan
   */
  public toString(): string {
    if (this._dateOfBirth !== null) {
      return `DOB: ${this._dateOfBirth.toISOString().split('T')[0]}, Age: ${this.age} years`;
    }
    
    if (this._knownAge !== null) {
      return `Age: ${this._knownAge} years`;
    }
    
    return 'Unknown lifespan';
  }
}
