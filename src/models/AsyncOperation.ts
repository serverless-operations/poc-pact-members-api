export default interface AsyncOperation {
  asyncRequestId: string
  status: 'processing' | 'completed'
  type: 'download_members'
  data: DownloadMembersData
}

export interface DownloadMembersData {
  downloadUrl: string | null
}
