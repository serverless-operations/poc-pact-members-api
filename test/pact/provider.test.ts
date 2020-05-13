import { Verifier, MessageProviderPact } from '@pact-foundation/pact'
import Environment from '~/Environment'
import PostAsyncDownloadMembersAction from '~/actions/PostAsyncDownloadMembersAction'
import BatchAggregateMembersEventAction from '~/event-actions/BatchAggregateMembersEventAction'
// import pkg from '../../package.json'

const {
  PROVIDER_BASE_URL,
  PACT_BROKER_URL,
  PACT_BROKER_TOKEN
} = process.env

const PROVIDER_VERSION = 'provider-0.0.0'

describe('Providers', () => {

  describe('API Provider', () => {
    const opts = {
      provider: 'poc-pact-members-api',
      providerBaseUrl: PROVIDER_BASE_URL!,
      pactBrokerUrl: PACT_BROKER_URL,
      consumerVersionTags: [ 'master' ],
      pactBrokerToken: PACT_BROKER_TOKEN,
      publishVerificationResult: true,
      providerVersion: PROVIDER_VERSION
    }

    test('Verify pact', async () => {
      const result = await new Verifier(opts).verifyProvider()
      expect(result).toBeTruthy()
    })
  })

  describe('EVENT Provider AsyncDownloadRequest', () => {
    // eslint-disable-next-line jest/expect-expect
    test('Verify AsyncDownloadRequest', async () => {
      const messageProviderPact = new MessageProviderPact({
        provider: 'poc-pact-members-api-AsyncDownloadMembers',
        messageProviders: {
          'AsyncDownloadRequest': async () => {
            const action = new PostAsyncDownloadMembersAction()
            const asyncOperation = await action.createAsyncOperation()
            return {
              EventSubscriptionArn: Environment.ASYNC_DOWNLOAD_MEMBERS_TOPIC_ARN,
              Sns: {
                Message: asyncOperation.asyncRequestId
              }
            }
          }
        },
        pactBrokerUrl: PACT_BROKER_URL,
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        // consumerVersionTags: [ 'master' ],
        // providerVersionTags: [ 'master' ],
        pactBrokerToken: PACT_BROKER_TOKEN,
        publishVerificationResult: true,
        providerVersion: PROVIDER_VERSION
      })

      await messageProviderPact.verify()
    })
  })

  describe('EVENT Provider BatchAggregateMembers', () => {

    // eslint-disable-next-line jest/expect-expect
    test('Verify BatchAggregateMembers', async () => {
      const messageProviderPact = new MessageProviderPact({
        provider: 'CloudWatch-Scheduled-Task',
        messageProviders: {
          'BatchAggregateMembers': async () => {
            return { 'detail-type': 'Scheduled Event' }
          }
        },

        pactBrokerUrl: PACT_BROKER_URL,
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        // consumerVersionTags: [ 'master' ],
        // providerVersionTags: [ 'master' ],
        pactBrokerToken: PACT_BROKER_TOKEN,
        publishVerificationResult: true,
        providerVersion: PROVIDER_VERSION
      })

      await messageProviderPact.verify()
    })

  })

  describe('EVENT Provider BatchRankMembers', () => {
    // eslint-disable-next-line jest/expect-expect
    test('Verify BatchRankMembers', async () => {
      const messageProviderPact = new MessageProviderPact({
        provider: 'poc-pact-members-event-BatchAggregateMembers',
        messageProviders: {
          'BatchRankMembers': async () => {
            const event = new BatchAggregateMembersEventAction()
              .createEvent(Environment.AGGREGATE_MEMBERS_DATA_OBJECT_KEY)
            return {
              s3: {
                bucket: { name: (await event).s3PutParams.Bucket },
                object: { key: (await event).s3PutParams.Key }
              }
            }
          }
        },
        pactBrokerUrl: PACT_BROKER_URL,
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        // consumerVersionTags: [ 'master' ],
        // providerVersionTags: [ 'master' ],
        pactBrokerToken: PACT_BROKER_TOKEN,
        publishVerificationResult: true,
        providerVersion: PROVIDER_VERSION
      })

      await messageProviderPact.verify()
    })
  })
})
