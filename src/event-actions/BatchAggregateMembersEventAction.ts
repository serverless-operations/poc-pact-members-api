import { ScheduledEvent } from 'aws-lambda'
import { v4 as uuidv4 } from 'uuid'

import Environment from '~/Environment'
import S3 from '~/aws/S3'
import EventProviderAction from '~/event-actions/EventProviderAction'
import BatchAggregateMembersService from '~/services/BatchAggregateMembersService'

// BatchAggregateMembers Consumer
// BatchRankMembers Provider
export default class BatchAggregateMembersEventAction implements EventProviderAction {

  public async handle(_record: ScheduledEvent) {

    const event = await this.createEvent()
    const result = await this.publishEvent(event.s3PutParams)

    console.log('@@ BatchAggregateMembersEventAction', JSON.stringify(result))
  }

  // Event Creater
  public async createEvent() {
    const data = await new BatchAggregateMembersService().aggregate()
    const objectKey = `batch_aggregation_members/${uuidv4()}.json`
    const event = {
      s3PutParams: {
        Bucket: Environment.S3_BUCKET,
        Key: objectKey,
        Body: JSON.stringify(data)
      }
    }
    return event
  }

  // Event Publisher
  public async publishEvent(params) {
    await S3.putObject(params).promise()
  }
}
