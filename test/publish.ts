/* eslint-disable @typescript-eslint/no-var-requires */
const pact = require('@pact-foundation/pact-node')
const path = require('path')
// const pkg = require('../package.json')
const dotenv = require('dotenv')
dotenv.config()

const PACT_BROKER_URL = process.env.PACT_BROKER_URL
const PACT_BROKER_TOKEN = process.env.PACT_BROKER_TOKEN

const opts = {
  pactFilesOrDirs: [ path.resolve(process.cwd(), '.pacts/pactFiles') ],
  pactBroker: PACT_BROKER_URL,
  pactBrokerToken: PACT_BROKER_TOKEN,
  tags: [ 'master' ],
  consumerVersion: 'consumer-0.0.0'
}

pact
  .publishPacts(opts)
  .then(() => {
    console.log('Pact contract publishing complete!')
    console.log('')
    console.log(`Head over to ${PACT_BROKER_URL} and login`)
    console.log('to see your published contracts.')
  })
  .catch((e: Error) => {
    console.log('Pact contract publishing failed: ', e)
  })
