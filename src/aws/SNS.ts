import { SNS } from 'aws-sdk'
import Environment from '~/Environment'

const client = new SNS({
  region: Environment.AWS_DEFAULT_REGION,
  maxRetries: 3,
  httpOptions: {
    connectTimeout: 2000,
    timeout: 4000
  },
})

export default client
