/**
 * Represents an HTTP exception with a specific status code and message.
 */
export class HttpException extends Error {
  /**
   * Creates a new HttpException instance.
   * @param {number} status - The HTTP status code for the exception.
   * @param {string} message - The message associated with the exception.
   */
  constructor(status, message) {
    super(message);
    this.status = status;
    this.message = message;
  }
}
