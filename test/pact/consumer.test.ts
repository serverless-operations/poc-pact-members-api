import path from 'path'
import { v4 as uuidv4 } from 'uuid'

import {
  MessageConsumerPact,
  Message,
  Matchers,
} from '@pact-foundation/pact'
const { like } = Matchers

import AsyncDownloadMembersEventAction from '~/event-actions/AsyncDownloadMembersEventAction'
import Environment from '~/Environment'
import DynamoDB from '~/aws/DynamoDB'
import AsyncOperation from '~/models/AsyncOperation'

const messagePact = new MessageConsumerPact({
  consumer: 'poc-pact-members-api-download',
  logLevel: 'debug',
  log: path.resolve(process.cwd(), '.pacts/logs', 'pact.log'),
  dir: path.resolve(process.cwd(), '.pacts/pactFiles'),
  provider: 'poc-pact-members-event',
  pactfileWriteMode: 'update'
})

const asyncRequestId = uuidv4()
const action = new AsyncDownloadMembersEventAction()

describe('Receive async download request', () => {

  beforeEach(async () => {

    // Prerequisite
    await DynamoDB.put({
      TableName: Environment.ASYNC_OPERATIONS_TABLE_NAME,
      Item: {
        asyncRequestId,
        status: 'processing',
        type: 'download_members',
        data: { downloadUrl: null }
      }
    }).promise()

    // Consume event
    await messagePact
      .given('Accepting AsyncDownloadRequest')
      .expectsToReceive('SNSEvent for AsyncDownloadRequest')
      .withContent({
        EventSubscriptionArn: like(Environment.ASYNC_DOWNLOAD_MEMBERS_TOPIC_ARN),
        Sns: {
          Message: like(asyncRequestId)
        }
      })
      .verify(async (m: Message) => await action.handle(m.contents))
  })

  test('Asserting a download request', async () => {

    const asyncOperation = await DynamoDB.get({
      TableName: Environment.ASYNC_OPERATIONS_TABLE_NAME,
      Key: { asyncRequestId },
      ConsistentRead: true
    }).promise().then(res => res.Item as AsyncOperation)

    expect(asyncOperation).toBeTruthy()
    expect(asyncOperation.asyncRequestId).toEqual(asyncRequestId)
    expect(asyncOperation.data.downloadUrl).toBeTruthy() // or you can test more like regex of URL, actually to be able to download, etc...
  })
})
