import { describe, it, expect, beforeEach } from 'vitest';
import { faker } from '@faker-js/faker';
import { Lifespan } from '../lifespan';
import { ValidationException } from '../../exceptions';

describe('Lifespan', () => {
  let fakerInstance: typeof faker;

  beforeEach(() => {
    fakerInstance = faker;
  });

  describe('can_get_lifespan_from_date_of_birth', () => {
    it.each([
      [-18, 0],
      [-2250, 6],
      [-364, 0],
      [-0, 0]
    ])('should calculate correct age for date %i days old', (daysOld, expectedAge) => {
      // Arrange
      const now = new Date();
      const dob = new Date(now);
      dob.setDate(dob.getDate() + daysOld);
      
      // Act
      const lifespan = new Lifespan(null, dob);
      
      // Assert
      expect(lifespan.dateOfBirth).toEqual(dob);
      expect(lifespan.knownAge).toBeNull();
      expect(lifespan.age).toBe(expectedAge);
      
      const ageInDays = lifespan.getAgeInDays();
      expect(ageInDays).toBe(daysOld * -1);
    });
  });

  describe('can_get_lifespan_from_age', () => {
    it.each([
      [0, 0],
      [6, 6],
      [1, 1]
    ])('should set correct age for known age %i', (inputAge, expectedAge) => {
      // Arrange & Act
      const lifespan = new Lifespan(inputAge);
      
      // Assert
      expect(lifespan.knownAge).toBe(expectedAge);
      expect(lifespan.dateOfBirth).toBeNull();
      expect(lifespan.getAgeInDays()).toBeNull();
    });
  });

  describe('dob_trumps_age', () => {
    it('should prioritize date of birth over known age', () => {
      // Arrange
      const validYearsOld = fakerInstance.number.int({ min: 0, max: 120 });
      const invalidYearsOld = fakerInstance.number.int({ min: 0, max: 120 });
      
      const now = new Date();
      const dob = new Date(now);
      dob.setFullYear(dob.getFullYear() - validYearsOld);
      
      // Act
      const lifespan = new Lifespan(invalidYearsOld, dob);
      
      // Assert
      expect(lifespan.dateOfBirth).toEqual(dob);
      expect(lifespan.age).toBe(validYearsOld);
      expect(lifespan.knownAge).toBeNull();
    });
  });

  describe('validation_tests', () => {
    it('should throw ValidationException for future date of birth', () => {
      // Arrange
      const futureDob = new Date();
      futureDob.setDate(futureDob.getDate() + 1);
      
      // Act & Assert
      expect(() => new Lifespan(null, futureDob)).toThrow(ValidationException);
      try {
        new Lifespan(null, futureDob);
      } catch (error: any) {
        expect(error.name).toBe('ValidationException');
        expect(error.field).toBe('Lifespan');
        expect(error.message).toBe('Date of birth must be in the past');
      }
    });

    it('should throw ValidationException for negative age', () => {
      // Act & Assert
      expect(() => new Lifespan(-1)).toThrow(ValidationException);
      try {
        new Lifespan(-1);
      } catch (error: any) {
        expect(error.name).toBe('ValidationException');
        expect(error.field).toBe('Lifespan');
        expect(error.message).toBe('Age cannot be less than zero years.');
      }
    });

    it('should throw ValidationException for age over 120 years', () => {
      // Act & Assert
      expect(() => new Lifespan(121)).toThrow(ValidationException);
      try {
        new Lifespan(121);
      } catch (error: any) {
        expect(error.name).toBe('ValidationException');
        expect(error.field).toBe('Lifespan');
        expect(error.message).toBe('Age cannot be more than 120 years.');
      }
    });
  });

  describe('life_stage_tests', () => {
    it.each([
      [null, 'Unknown'],
      [0, 'Infant'],
      [1, 'Toddler'],
      [2, 'Toddler'],
      [3, 'Child'],
      [12, 'Child'],
      [13, 'Adolescent'],
      [17, 'Adolescent'],
      [18, 'Adult'],
      [64, 'Adult'],
      [65, 'Senior'],
      [90, 'Senior']
    ])('should return correct life stage for age %s', (age, expectedLifeStage) => {
      // Arrange
      let lifespan: Lifespan;
      
      if (age === null) {
        lifespan = new Lifespan();
      } else {
        lifespan = new Lifespan(age);
      }
      
      // Act & Assert
      expect(lifespan.getLifeStage()).toBe(expectedLifeStage);
    });
  });

  describe('phi_friendly_string_tests', () => {
    it.each([
      [null, 'Unknown'],
      [0, '< 1 year'],
      [1, '1 years'],
      [89, '89 years'],
      [90, '> 89 years'],
      [120, '> 89 years']
    ])('should return correct PHI-friendly string for age %s', (age, expectedString) => {
      // Arrange
      let lifespan: Lifespan;
      
      if (age === null) {
        lifespan = new Lifespan();
      } else {
        lifespan = new Lifespan(age);
      }
      
      // Act & Assert
      expect(lifespan.getPhiFriendlyString()).toBe(expectedString);
    });
  });

  describe('static_factory_methods', () => {
    it('should create lifespan from known age using static method', () => {
      // Arrange & Act
      const age = 25;
      const lifespan = Lifespan.fromKnownAge(age);
      
      // Assert
      expect(lifespan.knownAge).toBe(age);
      expect(lifespan.dateOfBirth).toBeNull();
    });

    it('should create lifespan from date of birth using static method', () => {
      // Arrange
      const dob = new Date(2000, 0, 1);
      
      // Act
      const lifespan = Lifespan.fromDateOfBirth(dob);
      
      // Assert
      expect(lifespan.dateOfBirth).toEqual(dob);
      expect(lifespan.knownAge).toBeNull();
    });
  });

  describe('string_representation', () => {
    it('should return correct string representation with date of birth', () => {
      // Arrange
      const dob = new Date(2000, 0, 1);
      const lifespan = new Lifespan(null, dob);
      const expectedAge = lifespan.age;
      
      // Act & Assert
      expect(lifespan.toString()).toBe(`DOB: ${dob.toISOString().split('T')[0]}, Age: ${expectedAge} years`);
    });

    it('should return correct string representation with known age', () => {
      // Arrange
      const age = 25;
      const lifespan = new Lifespan(age);
      
      // Act & Assert
      expect(lifespan.toString()).toBe(`Age: ${age} years`);
    });

    it('should return unknown lifespan when no age or dob is provided', () => {
      // Arrange
      const lifespan = new Lifespan();
      
      // Act & Assert
      expect(lifespan.toString()).toBe('Unknown lifespan');
    });
  });
});
