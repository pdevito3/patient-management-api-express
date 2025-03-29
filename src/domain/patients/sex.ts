import { ValueObject } from '../value-object';

export class Sex extends ValueObject {
  private _sex: SexEnum = SexEnum.NotGiven;

  public get Value(): string {
    return this._sex.Name;
  }

  constructor(value?: string | SexEnum | null) {
    super();
    
    if (value === undefined || value === null) {
      this._sex = SexEnum.NotGiven;
    } else if (typeof value === 'string') {
      this.setValue(value);
    } else {
      this._sex = value;
    }
  }

  private setValue(value: string): void {
    if (!value || value.trim() === '') {
      this._sex = SexEnum.NotGiven;
      return;
    }

    const trimmedValue = value.trim();
    
    if (trimmedValue.toLowerCase() === 'm') {
      this._sex = SexEnum.Male;
      return;
    }
    
    if (trimmedValue.toLowerCase() === 'f') {
      this._sex = SexEnum.Female;
      return;
    }

    const parsed = SexEnum.tryFromName(trimmedValue, true);
    this._sex = parsed || SexEnum.NotGiven;
  }

  public isFemale(): boolean {
    return this._sex === SexEnum.Female;
  }

  public isMale(): boolean {
    return this._sex === SexEnum.Male;
  }

  public isUnknown(): boolean {
    return this._sex === SexEnum.Unknown;
  }

  public static of(value?: string): Sex {
    return new Sex(value);
  }

  public static listNames(): string[] {
    return SexEnum.List.map(x => x.Name);
  }

  public static Unknown(): Sex {
    return new Sex(SexEnum.Unknown);
  }

  public static Male(): Sex {
    return new Sex(SexEnum.Male);
  }

  public static Female(): Sex {
    return new Sex(SexEnum.Female);
  }

  public static NotGiven(): Sex {
    return new Sex(SexEnum.NotGiven);
  }

  public toString(): string {
    return this.Value;
  }
}

class SexEnum {
  private static _values: Map<number, SexEnum> = new Map();
  private static _valuesByName: Map<string, SexEnum> = new Map();

  public static readonly Unknown = new SexEnum('Unknown', 0);
  public static readonly Male = new SexEnum('Male', 1);
  public static readonly Female = new SexEnum('Female', 2);
  public static readonly NotGiven = new SexEnum('Not Given', 3);

  public static get List(): SexEnum[] {
    return Array.from(this._values.values());
  }

  private constructor(
    private readonly _name: string,
    private readonly _value: number
  ) {
    SexEnum._values.set(_value, this);
    SexEnum._valuesByName.set(_name.toLowerCase(), this);
  }

  public get Name(): string {
    return this._name;
  }

  public get Value(): number {
    return this._value;
  }

  public static fromName(name: string, ignoreCase: boolean = true): SexEnum | undefined {
    const searchName = ignoreCase ? name.toLowerCase() : name;
    return this._valuesByName.get(searchName);
  }

  public static tryFromName(name: string, ignoreCase: boolean = true): SexEnum | undefined {
    return this.fromName(name, ignoreCase);
  }

  public equals(other: SexEnum): boolean {
    return this === other;
  }
}
