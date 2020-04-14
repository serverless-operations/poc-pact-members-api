import { ErrorCode } from '~/errors/ErrorCode'

export default class AuthorizationError extends Error {

  public error: ErrorCode
  public cause?: Error

  public constructor(error: ErrorCode, message: string, cause?: Error) {

    super(message)
    super.name = 'AuthorizationError'

    this.error = error
    this.cause = cause

    Error.captureStackTrace(this, this.constructor)
  }
}
