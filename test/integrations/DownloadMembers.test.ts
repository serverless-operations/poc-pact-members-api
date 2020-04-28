import { Request } from 'lambda-api'

import Environment from '~/Environment'

import DynamoDB from '~/aws/DynamoDB'
import PostAsyncDownloadMembersAction from '~/actions/PostAsyncDownloadMembersAction'
import GetAsyncRequestStatusAction from '~/actions/GetAsyncRequestStatusAction'

const delay = async () => new Promise(res => setTimeout(() => res(), 5000))

const MAX_POLLING_COUNT = 10

describe('DownloadMembers operation test', () => {

  let asyncRequestId
  let pollingCount = 0

  test('Normal case', async () => {

    const asyncRequestAction = new PostAsyncDownloadMembersAction()
    const asyncRequestResult = await asyncRequestAction.handle({} as Request)

    asyncRequestId = asyncRequestResult.asyncRequestId

    expect(asyncRequestId).toBeTruthy()

    const getAsyncRequestStatusAction = new GetAsyncRequestStatusAction()
    const getAsyncRequestStatusResult = await getAsyncRequestStatusAction.handle({
      pathParameters: { 'request_id': asyncRequestId }
    } as unknown as Request)

    const { type, status } = getAsyncRequestStatusResult

    expect(type).toEqual('download_members')
    expect(status).toEqual('processing')

    for (;;) {
      if (pollingCount > MAX_POLLING_COUNT) {
        break
      }
      await delay()

      const result = await getAsyncRequestStatusAction.handle({
        pathParameters: { 'request_id': asyncRequestId }
      } as unknown as Request)
      if (result.status === 'completed' && result.data.downloadUrl) {
        break
      }
      pollingCount++
      console.log('pollingCount: ', pollingCount)
    }

    expect(pollingCount).toBeLessThanOrEqual(MAX_POLLING_COUNT)
  })

  afterAll(async () => {
    await DynamoDB.delete({ TableName: Environment.ASYNC_OPERATIONS_TABLE_NAME, Key: { asyncRequestId } }).promise()
  })
})
