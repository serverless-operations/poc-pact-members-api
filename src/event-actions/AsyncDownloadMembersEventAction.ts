import { SNSEventRecord } from 'aws-lambda'
import AsyncOperationService from '~/services/AsyncOperationService'
import AsyncDownloadMembersService from '~/services/AsyncDownloadMembersService'

// NOTE: PACT is not able to acceess private method
const adhocDelay = () => new Promise(res => setTimeout(() => res(), 5000))

// PACT CONSUMER !!
export default class AsyncDownloadMemberEventAction {

  public async handle(record: SNSEventRecord) {

    // NOTE PoC implemention
    await adhocDelay()

    const asyncOpsService = new AsyncOperationService()
    const downloadService = new AsyncDownloadMembersService()

    const asyncRequestId = record.Sns.Message

    const asyncOperation = await asyncOpsService.load(asyncRequestId)
    const downloadLink = await downloadService.generateMembersData(asyncOperation)

    asyncOperation.status = 'completed'
    asyncOperation.data.downloadUrl = downloadLink

    await asyncOpsService.update(asyncOperation)
  }
}
