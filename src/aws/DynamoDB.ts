import DynamoDB from 'aws-sdk/clients/dynamodb'
import Environment from '~/Environment'

const client = new DynamoDB.DocumentClient({
  region: Environment.AWS_DEFAULT_REGION,
  convertEmptyValues: true,
  maxRetries: 5,
  httpOptions: {
    connectTimeout: 2000,
    timeout: 4000
  }
})

export default client
