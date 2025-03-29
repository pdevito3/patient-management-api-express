import { describe, it, expect } from 'vitest';
import { Sex } from '../sex';

describe('Sex', () => {
  describe('default_to_not_given', () => {
    it.each([
      ['gibberish'],
      [null],
      [undefined],
      [''],
      ['   ']
    ])('should default to Not Given for input %s', (input) => {
      // Arrange & Act
      const sex = Sex.of(input as string);

      // Assert
      expect(sex.Value).toBe('Not Given');
    });
  });

  describe('can_transform_for_male', () => {
    it.each([
      ['m'],
      ['M'],
      ['Male'],
      ['MALE'],
      ['male'],
      ['  male  ']
    ])('should transform %s to Male', (input) => {
      // Arrange & Act
      const sex = Sex.of(input);

      // Assert
      expect(sex.Value).toBe('Male');
      expect(sex.isMale()).toBe(true);
      expect(sex.isFemale()).toBe(false);
      expect(sex.isUnknown()).toBe(false);
    });
  });

  describe('can_transform_for_female', () => {
    it.each([
      ['f'],
      ['F'],
      ['Female'],
      ['FEMALE'],
      ['female'],
      ['  female  ']
    ])('should transform %s to Female', (input) => {
      // Arrange & Act
      const sex = Sex.of(input);

      // Assert
      expect(sex.Value).toBe('Female');
      expect(sex.isFemale()).toBe(true);
      expect(sex.isMale()).toBe(false);
      expect(sex.isUnknown()).toBe(false);
    });
  });

  describe('static_factory_methods', () => {
    it('should create Unknown sex using static method', () => {
      // Arrange & Act
      const sex = Sex.Unknown();
      
      // Assert
      expect(sex.Value).toBe('Unknown');
      expect(sex.isUnknown()).toBe(true);
      expect(sex.isMale()).toBe(false);
      expect(sex.isFemale()).toBe(false);
    });

    it('should create Male sex using static method', () => {
      // Arrange & Act
      const sex = Sex.Male();
      
      // Assert
      expect(sex.Value).toBe('Male');
      expect(sex.isMale()).toBe(true);
      expect(sex.isFemale()).toBe(false);
      expect(sex.isUnknown()).toBe(false);
    });

    it('should create Female sex using static method', () => {
      // Arrange & Act
      const sex = Sex.Female();
      
      // Assert
      expect(sex.Value).toBe('Female');
      expect(sex.isFemale()).toBe(true);
      expect(sex.isMale()).toBe(false);
      expect(sex.isUnknown()).toBe(false);
    });

    it('should create Not Given sex using static method', () => {
      // Arrange & Act
      const sex = Sex.NotGiven();
      
      // Assert
      expect(sex.Value).toBe('Not Given');
      expect(sex.isFemale()).toBe(false);
      expect(sex.isMale()).toBe(false);
      expect(sex.isUnknown()).toBe(false);
    });
  });

  describe('list_names', () => {
    it('should return all sex enum names', () => {
      // Arrange & Act
      const names = Sex.listNames();
      
      // Assert
      expect(names).toContain('Unknown');
      expect(names).toContain('Male');
      expect(names).toContain('Female');
      expect(names).toContain('Not Given');
      expect(names.length).toBe(4);
    });
  });

  describe('string_representation', () => {
    it('should return the sex value as string', () => {
      // Arrange
      const male = Sex.Male();
      const female = Sex.Female();
      const unknown = Sex.Unknown();
      const notGiven = Sex.NotGiven();
      
      // Act & Assert
      expect(male.toString()).toBe('Male');
      expect(female.toString()).toBe('Female');
      expect(unknown.toString()).toBe('Unknown');
      expect(notGiven.toString()).toBe('Not Given');
    });
  });

  describe('constructor_behavior', () => {
    it('should accept SexEnum directly in constructor', () => {
      // This test is a bit tricky since SexEnum is a private class
      // We can test indirectly by using the static factory methods
      // which return instances created with the SexEnum values
      
      // Arrange & Act
      const male = Sex.Male();
      
      // Assert - we know this was created with SexEnum.Male
      expect(male.Value).toBe('Male');
    });
  });
});
