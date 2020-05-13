import S3 from '~/aws/S3'
import DynamoDB from '~/aws/DynamoDB'
import Member from '~/models/Member'
import Environment from '~/Environment'

export default class BatchRankMembersService {

  public async rankMembers(params: { s3: { bucket: string; objectKey: string; } }) {

    const members = await this.loadMembers(params.s3.bucket, params.s3.objectKey)

    await Promise.all(
      members.map(async (member: Member) => {

        const { userId } = member
        const historyCount = await this.aggregateHistory(userId)

        let rank: Member['rank'] = 'PENDING'
        if (historyCount > 1) { rank = 'SILVER' }
        if (historyCount > 2) { rank = 'GOLD' }

        await this.updateRank(userId, rank)
        console.log(`Processed ${member.userId}, rank: ${rank}, historyCount: ${historyCount}`)
      })
    )
  }

  public async loadMembers(bucket: string, objectKey): Promise<Member[]> {
    return await S3.getObject({
      Bucket: bucket,
      Key: objectKey
    }).promise().then(res => JSON.parse(res.Body!.toString()))
  }

  public async aggregateHistory(userId: string): Promise<number> {

    const history = await DynamoDB.query({
      TableName: Environment.LOGIN_HISTORY_TABLE_NAME,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise().then(res => res.Items as Member[])

    return history.length
  }

  public async updateRank(userId: string, rank: Member['rank']): Promise<void> {
    await DynamoDB.update({
      TableName: Environment.MEMBERS_TABLE_NAME,
      Key: { userId },
      ExpressionAttributeNames: {
        '#rank': 'rank',
      },
      ExpressionAttributeValues: {
        ':rank': rank
      },
      UpdateExpression: 'SET #rank = :rank'
    }).promise()
  }
}
