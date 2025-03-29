/**
 * Base entity class that provides common properties for all domain entities
 */
export abstract class BaseEntity {
  private _id: string;

  constructor() {
    this._id = crypto.randomUUID();
  }

  public get id(): string {
    return this._id;
  }

  protected set id(value: string) {
    this._id = value;
  }
}
