import { ErrorCode } from '~/errors/ErrorCode'

export default class ConflictError extends Error {

  public error: ErrorCode
  public cause?: Error

  public constructor(error: ErrorCode, message: string, cause?: Error) {

    super(message)
    super.name = 'ConflictError'

    this.error = error
    this.cause = cause

    Error.captureStackTrace(this, this.constructor)
  }
}
