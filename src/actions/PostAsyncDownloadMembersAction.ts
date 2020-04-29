import { Request } from 'lambda-api'
import SNS from '~/aws/SNS'
import AsyncOperationService from '~/services/AsyncOperationService'
import Environment from '~/Environment'

export type APIRequestBody = {
  // Empty body
}
export type APIResponseBody = {
  requestId: string
}

// PACT PROVIDER !!
export default class PostAsyncDownloadMembersAction {

  public async handle(_req: Request) {

    const { asyncRequestId } = await this.createAsyncOperation()
    await this.publishToSNS(asyncRequestId)

    return { asyncRequestId }
  }

  // Event Creater
  public async createAsyncOperation() {
    const service = new AsyncOperationService()
    const asyncOperation = await service.acceptRequest({ type: 'download_members' })

    return asyncOperation
  }

  // Event Publisher
  public async publishToSNS(asyncRequestId: string) {
    await SNS.publish({
      TopicArn: Environment.ASYNC_DOWNLOAD_MEMBERS_TOPIC_ARN,
      Message: asyncRequestId
    }).promise()
  }
}
