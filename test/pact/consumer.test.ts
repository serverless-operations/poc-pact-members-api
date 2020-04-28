import path from 'path'
import { v4 as uuidv4 } from 'uuid'

import {
  MessageConsumerPact,
  Message,
  Matchers,
} from '@pact-foundation/pact'
const { like } = Matchers

import DownloadMembersEventAction from '~/event-actions/DownloadMembersEventAction'
import Environment from '~/Environment'
import DynamoDB from '~/aws/DynamoDB'

const messagePact = new MessageConsumerPact({
  consumer: 'poc-pact-members-api-download',
  logLevel: 'debug',
  log: path.resolve(process.cwd(), '.pacts/logs', 'pact.log'),
  dir: path.resolve(process.cwd(), '.pacts/pactFiles'),
  provider: 'poc-pact-members-event',
  pactfileWriteMode: 'update'
})

const asyncRequestId = uuidv4()

describe('Receive async download request', () => {

  beforeEach(async () => {
    await DynamoDB.put({
      TableName: Environment.ASYNC_OPERATIONS_TABLE_NAME,
      Item: {
        asyncRequestId,
        status: 'processing',
        type: 'download_members',
        data: { downloadUrl: null }
      }
    }).promise()
  })

  // eslint-disable-next-line jest/expect-expect
  test('accepts a download request', async () => {

    const action = new DownloadMembersEventAction()

    await messagePact
      .given('AsyncDownloadRequest')
      .expectsToReceive('AsyncDownloadRequest')
      .withContent({
        EventSubscriptionArn: like(Environment.ASYNC_DOWNLOAD_MEMBERS_TOPIC_ARN),
        Sns: {
          Message: like(asyncRequestId)
        }
      })
      .verify(async (m: Message) =>  await action.handle(m.contents))
  })
})
