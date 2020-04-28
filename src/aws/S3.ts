import { S3 } from 'aws-sdk'
import Environment from '~/Environment'

const client = new S3({
  region: Environment.AWS_DEFAULT_REGION,
  maxRetries: 3,
  httpOptions: {
    connectTimeout: 2000,
    timeout: 4000
  },
})

export default client
