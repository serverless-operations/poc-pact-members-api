import { SNSEventRecord } from 'aws-lambda'
import AsyncOperationService from '~/services/AsyncOperationService'
import AsyncDownloadMembersService from '~/services/AsyncDownloadMembersService'

export default class DownloadMemberEventAction {

  public async handle(record: SNSEventRecord) {

    // NOTE PoC implemention
    await this.adhocDelay()

    const opsService = new AsyncOperationService()
    const downloadService = new AsyncDownloadMembersService()

    const asyncRequestId = record.Sns.Message

    const asyncOperation = await opsService.loadAsyncOperationRecord(asyncRequestId)
    const downloadLink = await downloadService.generateMembersData(asyncOperation)

    asyncOperation.status = 'completed'
    asyncOperation.data.downloadUrl = downloadLink

    await opsService.updateAsyncOperationRecord(asyncOperation)
  }

  private async adhocDelay() {
    return new Promise(res => setTimeout(() => res(), 15000))
  }
}
