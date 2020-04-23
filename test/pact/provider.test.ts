import { Verifier } from '@pact-foundation/pact'
import pkg from '../../package.json'

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
    tags: [ 'latest' ],
    pactBrokerToken: PACT_BROKER_TOKEN,
    publishVerificationResult: true,
    providerVersion: pkg.version,
  }

  test('Verify pact', async () => {
    const result = await new Verifier().verifyProvider(opts)
    expect(result).toBeTruthy()
  })
})
