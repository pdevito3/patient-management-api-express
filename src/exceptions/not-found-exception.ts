/**
 * Exception thrown when an entity is not found
 */
export class NotFoundException extends Error {
  constructor();
  constructor(message: string);
  constructor(message: string, innerException: Error);
  constructor(name: string, key: any);
  constructor(
    messageOrName?: string,
    keyOrInnerException?: any
  ) {
    if (messageOrName === undefined) {
      super();
    } else if (keyOrInnerException instanceof Error) {
      super(messageOrName, { cause: keyOrInnerException });
    } else if (keyOrInnerException !== undefined) {
      super(`Entity "${messageOrName}" (${keyOrInnerException}) was not found.`);
    } else {
      super(messageOrName);
    }

    this.name = 'NotFoundException';
  }
}
