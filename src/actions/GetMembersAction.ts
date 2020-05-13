import { Request } from 'lambda-api'
import DynamoDB from '~/aws/DynamoDB'
import Member from '~/models/Member'
import Environment from '~/Environment'

export default class GetMembersAction {

  public async handle(_req: Request): Promise<Member[]> {
    return await DynamoDB.scan({
      TableName: Environment.MEMBERS_TABLE_NAME,
    }).promise().then(res => res.Items as Member[])
  }
}
