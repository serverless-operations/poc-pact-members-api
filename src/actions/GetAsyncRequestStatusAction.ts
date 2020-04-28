import { Request, Response } from 'lambda-api'
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

  public async handle(req: Request, res: Response) {

    const validated = this.validate(req.pathParameters)

    const service = new AsyncOperationService()
    const asyncOperation = await service.getStatus(validated.asyncRequestId)
    const { asyncRequestId, type, status, data } = asyncOperation

    if (status !== 'completed') {
      res.status(200).json({ asyncRequestId, status })
    }

    if (type === 'download_members' && data.downloadUrl) {
      res.status(302).location(data.downloadUrl).json({ asyncRequestId, status })
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
