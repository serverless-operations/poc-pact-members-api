import { Verifier, MessageProviderPact } from '@pact-foundation/pact'
import { v4 as uuidv4 } from 'uuid'
import DynamoDB from '~/aws/DynamoDB'
import Environment from '~/Environment'
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
        'AsyncDownloadRequest': async () => {

          // FIXME Separate 'Create' and 'Publish' message
          const asyncRequestId = uuidv4()
          await DynamoDB.put({
            TableName: Environment.ASYNC_OPERATIONS_TABLE_NAME,
            Item: {
              asyncRequestId,
              type: 'download_members',
              status: 'processing',
              data: { downloadUrl: null }
            }
          }).promise()

          return { // Should I make this myself...?
            EventSubscriptionArn: Environment.ASYNC_DOWNLOAD_MEMBERS_TOPIC_ARN,
            Sns: {
              Message: asyncRequestId
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
