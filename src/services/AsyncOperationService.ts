import { v4 as uuidv4 } from 'uuid'

import DynamoDB from '~/aws/DynamoDB'

import Environment from '~/Environment'
import AsyncOperation from '~/models/AsyncOperation'
import InternalServerError from '~/errors/InternalServerError'
import NotFoundError from '~/errors/NotFoundError'

export default class AsyncOperationRequestService {

  public async load(asyncRequestId: string) {

    const asyncOperation = await DynamoDB.get({
      TableName: Environment.ASYNC_OPERATIONS_TABLE_NAME,
      Key: { asyncRequestId },
      ConsistentRead: true
    }).promise().then(res => res.Item as AsyncOperation)

    if (!asyncOperation) {
      throw new Error(`asyncOperation is not found - asyncRequestId: ${asyncRequestId}`)
    }

    return asyncOperation
  }

  public async update(asyncOperation: AsyncOperation) {
    await DynamoDB.put({ // TODO Use UPDATE
      TableName: Environment.ASYNC_OPERATIONS_TABLE_NAME,
      Item: asyncOperation
    }).promise()
  }

  public async acceptRequest(params: { type: AsyncOperation['type'] }): Promise<AsyncOperation> {

    switch (params.type) {

      case 'download_members':
        return await this.acceptDownloadMembers()

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

  private async acceptDownloadMembers(): Promise<AsyncOperation> {

    const asyncRequestId = uuidv4()

    const asyncOperation: AsyncOperation = {
      asyncRequestId,
      type: 'download_members',
      status: 'processing',
      data: { downloadUrl: null }
    }

    await DynamoDB.put({
      TableName: Environment.ASYNC_OPERATIONS_TABLE_NAME,
      Item: asyncOperation
    }).promise()

    return asyncOperation
  }
}
