import { v4 as uuidv4 } from 'uuid'

import DynamoDB from '~/aws/DynamoDB'
import Environment from '~/Environment'
import S3 from '~/aws/S3'
import AsyncOperation from '~/models/AsyncOperation'
import InternalServerError from '~/errors/InternalServerError'


export default class AsyncDownloadMembersService  {

  public async generateMembersData(asyncOperation: AsyncOperation): Promise<string> {

    const { type, status } = asyncOperation

    if (type !== 'download_members' || status !== 'processing') {
      console.log('Invalid asyncOperation', JSON.stringify(asyncOperation))
      throw new InternalServerError('ASSERTION_ERROR',
        'Unexpected asyncOperation values. There seems to be something wrong.')
    }

    // NOTE PoC implemention
    const members = await DynamoDB.scan({ TableName: Environment.MEMBERS_TABLE_NAME }).promise().then(res => res.Items)
    const objectKey = `${uuidv4()}.json`

    await S3.putObject({
      Bucket: Environment.S3_BUCKET,
      Key: objectKey,
      Body: JSON.stringify(members)
    }).promise()

    const downloadUrl = await S3.getSignedUrlPromise('getObject', {
      Bucket: Environment.S3_BUCKET,
      Key: objectKey,
      Expires: 600
    })

    return downloadUrl
  }
}
