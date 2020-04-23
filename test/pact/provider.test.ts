import { Verifier } from '@pact-foundation/pact'
// import pkg from '../../package.json'

const {
  PROVIDER_BASE_URL,
  PACT_BROKER_URL,
  PACT_BROKER_TOKEN
} = process.env

describe('Provider test', () => {

  const opts = {
    provider: 'poc-pact-members-api',
    providerBaseUrl: PROVIDER_BASE_URL!,
    pactBrokerUrl: PACT_BROKER_URL,
    consumerVersionTags: [ 'master' ],
    pactBrokerToken: PACT_BROKER_TOKEN,
    publishVerificationResult: true,
    providerVersion: 'provider-0.0.0'
  }

  test('Verify pact', async () => {
    const result = await new Verifier(opts).verifyProvider()
    expect(result).toBeTruthy()
  })
})
