import { ErrorCode } from '~/errors/ErrorCode'

export default class InternalServerError extends Error {

  public error: ErrorCode
  public cause?: Error

  /**
  * Constructs a new error
  *
  * @param error Descriptive error name to identify it
  * @param message Error description
  * @param cause Error instance causing the error case
  */
  public constructor(error: ErrorCode, message: string, cause?: Error) {

    super(message)
    super.name = 'InternalServerError'

    this.error = error
    this.cause = cause

    Error.captureStackTrace(this, this.constructor)
  }
}
