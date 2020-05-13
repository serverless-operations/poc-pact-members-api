import { S3EventRecord } from 'aws-lambda'
import BatchRankMembersService from '~/services/BatchRankMembersService'

// BatchRankMembers Consumer
export default class BatchRankMembersEventAction {

  public async handle(record: S3EventRecord) {
    await new BatchRankMembersService().rankMembers({
      s3: {
        bucket: record.s3.bucket.name,
        objectKey: record.s3.object.key
      }
    })
  }
}
