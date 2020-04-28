import { Handler } from 'aws-lambda'
import Environment from './Environment'
import DownloadMemberEventAction from './event-actions/DownloadMembersEventAction'

export const handler: Handler = async (event): Promise<void> => {

  console.log('Received event from SNS', JSON.stringify(event))

  await Promise.all(
    event.Records.map(async record => {

      if (record.EventSubscriptionArn.startsWith(Environment.ASYNC_DOWNLOAD_MEMBERS_TOPIC_ARN)) {
        await new DownloadMemberEventAction().handle(record)
      }

    })
  ).catch(err => console.error('Process failed due to unexpected error', err))
}
