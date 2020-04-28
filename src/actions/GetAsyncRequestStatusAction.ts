import { Request } from 'lambda-api'
import AsyncOperationService from '~/services/AsyncOperationService'
import ValidationError from '~/errors/ValidationError'
import InternalServerError from '~/errors/InternalServerError'

export type APIRequestBody = {
  // Empty body
}
export type APIResponseBody = {
  requestId: string
  status: string
}

export default class GetAsyncRequestStatusAction {

  public async handle(req: Request) {

    const validated = this.validate(req.pathParameters)

    const service = new AsyncOperationService()
    const asyncOperation = await service.getStatus(validated.asyncRequestId)
    const { type, status, data } = asyncOperation

    if (status !== 'completed') {
      return { ...asyncOperation }
    }

    if (type === 'download_members' && data.downloadUrl) {
      return { ...asyncOperation }
    }

    throw new InternalServerError('UNEXPECTED_ERROR', 'Thrown unexpected error during checking async operation status')
  }

  private validate(pathParameters: Request['pathParameters']) {

    const asyncRequestId = pathParameters?.request_id
    if (!asyncRequestId) {
      throw new ValidationError('MISSING_REQUIRED_PARAMETER', 'Missing required parameter - asyncRequestId')
    }
    return { asyncRequestId }
  }
}
