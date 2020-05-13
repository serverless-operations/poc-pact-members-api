import Environment from '~/Environment'
import DynamoDB from '~/aws/DynamoDB'
import Member from '~/models/Member'

export default class BatchAggregateMembersService {

  public async aggregate(): Promise<Member[]> {

    // NOTE PoC implemention. This would be suppose to be replaced with Kinesis, etc.
    const members = await DynamoDB.scan({ TableName: Environment.MEMBERS_TABLE_NAME }).promise().then(res => res.Items)

    return members as Member[]
  }
}
