export default Object.freeze({
  // default values
  STAGE: 'dev',
  LOG_LEVEL: 'debug',
  AWS_DEFAULT_REGION: 'us-west-2',
  MEMBERS_TABLE_NAME: 'poc-pact-members-dev',
  ...process.env
})
