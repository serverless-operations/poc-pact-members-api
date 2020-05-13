import { Handler } from 'aws-lambda'
import Environment from '~/Environment'
import AsyncDownloadMembersEventAction from '~/event-actions/AsyncDownloadMembersEventAction'
import BatchRankMembersEventAction from '~/event-actions/BatchRankMembersEventAction'
import BatchAggregateMembersEventAction from '~/event-actions/BatchAggregateMembersEventAction'

export const handler: Handler = async (event, context): Promise<void> => {
  console.log('Received event', JSON.stringify(event))

  if (event['detail-type'] === 'Scheduled Event') {
    console.log('BatchAggregateMembersEventAction')
    await new BatchAggregateMembersEventAction().handle(event)
    context.done()
  }

  await Promise.all(
    event.Records.map(async record => {
      if (record.EventSource === 'aws:sns'
      && record.EventSubscriptionArn.startsWith(Environment.ASYNC_DOWNLOAD_MEMBERS_TOPIC_ARN)) {
        console.log('AsyncDownloadMembersEventAction')
        await new AsyncDownloadMembersEventAction().handle(record)
        context.done()

      }
      if (record.eventSource === 'aws:s3') {
        console.log('BatchRankMembersEventAction')
        await new BatchRankMembersEventAction().handle(record)
        context.done()
      }
    })
  ).catch(err => console.error('Process failed due to unexpected error', err))

  console.log('There is no event handler for this event')
}
