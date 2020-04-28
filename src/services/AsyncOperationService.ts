import { v4 as uuidv4 } from 'uuid'

import SNS from '~/aws/SNS'
import DynamoDB from '~/aws/DynamoDB'

import Environment from '~/Environment'
import AsyncOperation from '~/models/AsyncOperation'
import InternalServerError from '~/errors/InternalServerError'
import NotFoundError from '~/errors/NotFoundError'

export default class AsyncOperationRequestService {

  public async acceptRequest(params: { type: AsyncOperation['type'] }): Promise<string> {

    switch (params.type) {

      case 'download_members':
        return await this.requestDownloadMembers()

      default:
        throw new InternalServerError('UNEXPECTED_ERROR', 'Unexpected error thrown during async operation request')
    }
  }

  public async getStatus(asyncRequestId: string) {

    const asyncOperation = await DynamoDB.get({
      TableName: Environment.ASYNC_OPERATIONS_TABLE_NAME,
      Key: { asyncRequestId }
    }).promise().then(res => res.Item as AsyncOperation)

    if (!asyncOperation) {
      throw new NotFoundError('NOT_FOUND_ERROR', 'asyncRequestId is not found')
    }

    return asyncOperation
  }

  private async requestDownloadMembers(): Promise<string> {

    const asyncRequestId = uuidv4()

    const downloadMembersRequest: AsyncOperation = {
      asyncRequestId,
      type: 'download_members',
      status: 'processing',
      data: { downloadUrl: null }
    }

    await DynamoDB.put({
      TableName: Environment.ASYNC_OPERATIONS_TABLE_NAME,
      Item: downloadMembersRequest
    }).promise()

    await SNS.publish({
      TopicArn: Environment.ASYNC_OPERATION_SNS_TOPIC_ARN,
      Message: asyncRequestId
    }).promise()

    return asyncRequestId
  }
}
