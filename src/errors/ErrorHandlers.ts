
import { Request, Response, ErrorHandlingMiddleware } from 'lambda-api'
import { ErrorCode } from '~/errors/ErrorCode'

import AuthorizationError from '~/errors/AuthorizationError'
import ConflictError from '~/errors/ConflictError'
import ForbiddenError from '~/errors/ForbiddenError'
import InternalServerError from '~/errors/InternalServerError'
import ValidationError from '~/errors/ValidationError'

interface ResponseParams {
  res: Response
  statusCode: number
  error: ErrorCode
  message: string
  /* eslint-disable @typescript-eslint/no-explicit-any */
  errorData?: any
}

const respond = ({ res, statusCode, error, message, errorData }: ResponseParams) =>
  res.status(statusCode).cors({}).json({ error, message, errorData })

const errorSentinel = (err: Error, req: Request, res: Response, next: ErrorHandlingMiddleware): void => {
  respond({
    res,
    statusCode: 500,
    error: 'UNEXPECTED_ERROR',
    message: 'Thrown unexpected error.'
  })
  next(err, req, res, next)
}

const validationErrorHandler = (err: Error, req: Request, res: Response, next: ErrorHandlingMiddleware): void => {
  if (err instanceof ValidationError) {
    const { error, message } = err
    respond({ res, statusCode: 400, error, message })
  }
  next(err, req, res, next)
}

const authorizationErrorHandler = (err: Error, req: Request, res: Response, next: ErrorHandlingMiddleware): void => {
  if (err instanceof AuthorizationError) {
    const { error, message } = err
    respond({ res, statusCode: 401, error, message })
  }
  next(err, req, res, next)
}

const forbiddenErrorHandler = (err: Error, req: Request, res: Response, next: ErrorHandlingMiddleware): void => {
  if (err instanceof ForbiddenError) {
    const { error, message } = err
    respond({ res, statusCode: 403, error, message })
  }
  next(err, req, res, next)
}

const conflictErrorHandler = (err: Error, req: Request, res: Response, next: ErrorHandlingMiddleware): void => {
  if (err instanceof ConflictError) {
    const { error, message } = err
    respond({ res, statusCode: 409, error, message })
  }
  next(err, req, res, next)
}

const internalServerErrorHandler = (err: Error, req: Request, res: Response, next: ErrorHandlingMiddleware): void => {
  if (err instanceof InternalServerError) {
    const { error, message } = err
    respond({ res, statusCode: 500, error, message })
  }
  next(err, req, res, next)
}

export default [
  validationErrorHandler,
  authorizationErrorHandler,
  forbiddenErrorHandler,
  conflictErrorHandler,
  internalServerErrorHandler,
  errorSentinel
]
