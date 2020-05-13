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
import Member from '~/models/Member'
import { MessageConsumerOptions } from '@pact-foundation/pact/dsl/options'
import BatchAggregateMembersEventAction from '~/event-actions/BatchAggregateMembersEventAction'
import BatchRankMembersEventAction from '~/event-actions/BatchRankMembersEventAction'

const pactOptions: MessageConsumerOptions = {
  consumer: 'poc-pact-members-api',
  logLevel: 'debug',
  log: path.resolve(process.cwd(), '.pacts/logs', 'pact.log'),
  dir: path.resolve(process.cwd(), '.pacts/pactFiles'),
  provider: 'poc-pact-members-event',
  pactfileWriteMode: 'update'
}

const asyncDownloadMessagePact = new MessageConsumerPact({
  ...pactOptions,
  consumer: 'poc-pact-members-event-AsyncDownloadMembers',
  provider: 'poc-pact-members-api-AsyncDownloadMembers'

})

const batchAggregateMembersPact = new MessageConsumerPact({
  ...pactOptions,
  consumer: 'poc-pact-members-event-BatchAggregateMembers',
  provider: 'CloudWatch-Scheduled-Task'
})

const batchRankMembersPact = new MessageConsumerPact({
  ...pactOptions,
  consumer: 'poc-pact-members-event-BatchRankMembers',
  provider: 'poc-pact-members-event-BatchAggregateMembers'
})

const asyncDownloadMembersEventAction = new AsyncDownloadMembersEventAction()
const batchAggregateMembersEventAction = new BatchAggregateMembersEventAction()
const batchRankMembersEventAction = new BatchRankMembersEventAction()

const asyncRequestId = uuidv4()

describe('Receive async download request', () => {

  let batchAggregateMembersEventActionResult

  beforeAll(async () => {

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

    // Add test members
    // Add test login history

    // Consume event
    await asyncDownloadMessagePact
      .expectsToReceive('AsyncDownloadRequest')
      .withContent({
        EventSubscriptionArn: like(Environment.ASYNC_DOWNLOAD_MEMBERS_TOPIC_ARN),
        Sns: {
          Message: like(asyncRequestId)
        }
      })
      .verify(async (m: Message) => await asyncDownloadMembersEventAction.handle(m.contents))

    await batchAggregateMembersPact
      .expectsToReceive('BatchAggregateMembers')
      .withContent({
        'detail-type': 'Scheduled Event'
      })
      .verify(async (_m: Message) => {
        batchAggregateMembersEventActionResult = await batchAggregateMembersEventAction.createEvent(asyncRequestId)
      })

    await batchRankMembersPact
      .expectsToReceive('BatchRankMembers')
      .withContent({
        s3: {
          bucket: { name: like(Environment.S3_BUCKET) },
          object: { key: like(Environment.AGGREGATE_MEMBERS_DATA_OBJECT_KEY) }
        }
      })
      .verify(async (m: Message) => await batchRankMembersEventAction.handle(m.contents))
  })

  test('Asserting AsyncDownloadRequest', async () => {

    const asyncOperation = await DynamoDB.get({
      TableName: Environment.ASYNC_OPERATIONS_TABLE_NAME,
      Key: { asyncRequestId },
      ConsistentRead: true
    }).promise().then(res => res.Item as AsyncOperation)

    expect(asyncOperation).toBeTruthy()
    expect(asyncOperation.asyncRequestId).toEqual(asyncRequestId)
    expect(asyncOperation.data.downloadUrl).toBeTruthy() // or you can test more like regex of URL, actually to be able to download, etc...
  })

  test('Asserting BatchAggregateMembers', async () => {
    expect(batchAggregateMembersEventActionResult.s3PutParams.Key).toEqual(`batch_aggregation_members/${asyncRequestId}.json`)
  })

  test('Asserting BatchRankMembers', async () => {

    const member = await DynamoDB.get({
      TableName: Environment.MEMBERS_TABLE_NAME,
      Key: { userId: 'user-1' },
      ConsistentRead: true
    }).promise().then(res => res.Item as Member)

    expect(member.rank).toEqual('GOLD')
  })
})
