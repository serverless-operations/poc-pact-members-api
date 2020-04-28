import { Request } from 'lambda-api'
import AsyncOperationService from '~/services/AsyncOperationService'

export type APIRequestBody = {
  // Empty body
}
export type APIResponseBody = {
  requestId: string
}

export default class PostAsyncDownloadMembersAction {

  public async handle(_req: Request) {

    const service = new AsyncOperationService()
    const asyncRequestId = await service.acceptRequest({ type: 'download_members' })

    return { asyncRequestId }
  }
}
