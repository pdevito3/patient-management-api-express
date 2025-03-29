/**
 * Value Object base class
 * Adapted from https://github.com/jhewlett/ValueObject
 */
export abstract class ValueObject {
  /**
   * Compares this value object to another value object for equality
   */
  public static equals(obj1?: ValueObject | null, obj2?: ValueObject | null): boolean {
    if (obj1 === obj2) {
      return true;
    }
    
    if (!obj1 && !obj2) {
      return true;
    }
    
    if (!obj1 || !obj2) {
      return false;
    }
    
    return obj1.equals(obj2);
  }
  
  /**
   * Inequality operator for value objects
   */
  public static notEquals(obj1?: ValueObject | null, obj2?: ValueObject | null): boolean {
    return !ValueObject.equals(obj1, obj2);
  }
  
  /**
   * Checks if this value object equals another object
   */
  public equals(obj?: any): boolean {
    if (obj === null || obj === undefined) {
      return false;
    }
    
    if (this === obj) {
      return true;
    }
    
    if (this.constructor.name !== obj.constructor.name) {
      return false;
    }
    
    // Compare all properties
    const properties = this.getProperties();
    for (const key of properties) {
      if (!this.propertiesAreEqual(this[key as keyof this], obj[key])) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Gets all properties of this object
   */
  protected getProperties(): string[] {
    const properties: string[] = [];
    
    // Get all properties from the object
    for (const propertyName of Object.getOwnPropertyNames(this)) {
      // Skip private properties (starting with _) and functions
      if (!propertyName.startsWith('_') && 
          typeof (this as any)[propertyName] !== 'function' &&
          !this.isIgnoredMember(propertyName)) {
        properties.push(propertyName);
      }
    }
    
    return properties;
  }
  
  /**
   * Checks if a property is marked to be ignored
   */
  protected isIgnoredMember(propertyName: string): boolean {
    // This would be implemented by decorators in a real application
    // For now, we'll just return false
    return false;
  }
  
  /**
   * Compares two property values for equality
   */
  private propertiesAreEqual(value1: any, value2: any): boolean {
    if (value1 === value2) {
      return true;
    }
    
    if (value1 === null || value2 === null || value1 === undefined || value2 === undefined) {
      return false;
    }
    
    if (typeof value1 === 'object' && typeof value2 === 'object') {
      if (Array.isArray(value1) && Array.isArray(value2)) {
        return this.arraysAreEqual(value1, value2);
      }
      
      if (value1 instanceof ValueObject && value2 instanceof ValueObject) {
        return value1.equals(value2);
      }
      
      // For other objects, compare their JSON representation
      return JSON.stringify(value1) === JSON.stringify(value2);
    }
    
    return value1 === value2;
  }
  
  /**
   * Compares two arrays for equality
   */
  private arraysAreEqual(array1: any[], array2: any[]): boolean {
    if (array1.length !== array2.length) {
      return false;
    }
    
    for (let i = 0; i < array1.length; i++) {
      if (!this.propertiesAreEqual(array1[i], array2[i])) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Generates a hash code for this value object
   */
  public getHashCode(): number {
    let hash = 17;
    const properties = this.getProperties();
    
    for (const key of properties) {
      const value = (this as any)[key];
      hash = this.hashValue(hash, value);
    }
    
    return hash;
  }
  
  /**
   * Hashes a specific value
   */
  private hashValue(seed: number, value: any): number {
    if (value === null || value === undefined) {
      return seed * 23;
    }
    
    if (typeof value === 'object') {
      if (value instanceof ValueObject) {
        return seed * 23 + value.getHashCode();
      }
      
      if (Array.isArray(value)) {
        let hashCode = 0;
        for (const item of value) {
          hashCode += this.hashValue(seed, item);
        }
        return seed * 23 + hashCode;
      }
      
      // For other objects, use their JSON string for hashing
      return seed * 23 + this.stringHashCode(JSON.stringify(value));
    }
    
    if (typeof value === 'string') {
      return seed * 23 + this.stringHashCode(value);
    }
    
    return seed * 23 + value.toString().hashCode;
  }
  
  /**
   * Computes a hash code for a string
   */
  private stringHashCode(str: string): number {
    let hash = 0;
    if (str.length === 0) return hash;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return hash;
  }
}

/**
 * Decorator to mark properties that should be ignored when comparing value objects
 */
export function IgnoreMember() {
  return function(target: any, propertyKey: string) {
    // In a real implementation, this would store metadata that would be used by isIgnoredMember
    // For now, this is just a placeholder
  };
}
