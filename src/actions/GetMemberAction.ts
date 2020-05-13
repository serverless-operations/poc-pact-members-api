import { Request } from 'lambda-api'
import DynamoDB from '~/aws/DynamoDB'
import ValidationError from '~/errors/ValidationError'
import Member from '~/models/Member'
import Environment from '~/Environment'
import NotFoundError from '~/errors/NotFoundError'

export default class GetMemberAction {

  public async handle(req: Request): Promise<Member> {

    const { userId } = this.validate(req.pathParameters)

    const member = await DynamoDB.get({
      TableName: Environment.MEMBERS_TABLE_NAME,
      Key: { userId }
    }).promise().then(res => res.Item as Member)

    if (!member) {
      throw new NotFoundError('NOT_FOUND_ERROR', 'Member is not found')
    }
    await this.registerHistory(userId)

    return member
  }

  private validate(pathParameters: Request['pathParameters']) {
    const userId = pathParameters?.user_id
    if (!userId) {
      throw new ValidationError('MISSING_REQUIRED_PARAMETER', 'Missing required parameter - userId')
    }
    return { userId }
  }

  public async registerHistory(userId: string) {
    await DynamoDB.put({
      TableName: Environment.LOGIN_HISTORY_TABLE_NAME,
      Item: { userId, timestamp: new Date().toISOString(), ttl: 1609459200 }
    }).promise()
  }
}
