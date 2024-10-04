export default interface ValidationService<T> {
  /**
   * Validates the given data and throws an error if validation fails.
   * @param data - The data to be validated.
   * @throws Error if validation fails.
   */
  validate(data: T): void;
}
