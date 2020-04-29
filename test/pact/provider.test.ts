import { Verifier, MessageProviderPact } from '@pact-foundation/pact'
import Environment from '~/Environment'
import PostAsyncDownloadMembersAction from '~/actions/PostAsyncDownloadMembersAction'
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

  describe('EVENT Provider', () => {

    const messageProviderPact = new MessageProviderPact({
      provider: 'poc-pact-members-event',
      messageProviders: {

        'SNSEvent for AsyncDownloadRequest': async () => {
          const action = new PostAsyncDownloadMembersAction()
          const asyncOperation = await action.createAsyncOperation()
          return {
            EventSubscriptionArn: Environment.ASYNC_DOWNLOAD_MEMBERS_TOPIC_ARN,
            Sns: {
              Message: asyncOperation.asyncRequestId
            }
          }
        },

      },
      pactBrokerUrl: PACT_BROKER_URL,
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      // consumerVersionTags: [ 'master' ],
      consumerVersionTags: [ 'master' ],
      pactBrokerToken: PACT_BROKER_TOKEN,
      publishVerificationResult: true,
      providerVersion: PROVIDER_VERSION
    })

    // eslint-disable-next-line jest/expect-expect
    test('Verify pact', async () => {
      await messageProviderPact.verify()
    })
  })

})
