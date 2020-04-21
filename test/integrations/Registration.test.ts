import { Request } from 'lambda-api'

import Environment from '~/Environment'
import DynamoDB from '~/aws/DynamoDB'
import PostRegistrationAction from '~/actions/PostRegistrationAction'

describe('Registration test', () => {

  const MEMBERS_TABLE_NAME = Environment.MEMBERS_TABLE_NAME
  const TEST_USER_ID = 'test-user-id'

  test('Normal case', async () => {
    const sample = {
      userId: TEST_USER_ID,
      nickname: 'test-user-nickname',
      gender: 'male',
      ageGroup: 'thirties',
      tosAgreed: true
    }
    const action = new PostRegistrationAction()
    const result = await action.handle({ body: sample } as Request)

    const actual = await DynamoDB.get({
      TableName: MEMBERS_TABLE_NAME,
      Key: { userId: TEST_USER_ID },
      ConsistentRead: true
    }).promise()

    expect(result).toEqual(sample)
    expect(actual.Item).toEqual(sample)
  })

  afterAll(async () => {
    await DynamoDB.delete({ TableName: MEMBERS_TABLE_NAME, Key: { userId: TEST_USER_ID } }).promise()
  })
})
