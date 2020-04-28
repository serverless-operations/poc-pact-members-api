export default Object.freeze({
  // default values
  STAGE: 'dev',
  LOG_LEVEL: 'debug',
  AWS_DEFAULT_REGION: 'us-west-2',
  ASYNC_OPERATION_SNS_TOPIC_ARN: '',
  MEMBERS_TABLE_NAME: 'poc-pact-members-dev',
  ASYNC_OPERATIONS_TABLE_NAME: 'poc-pact-members-async-operations-dev',
  ...process.env
})
