import MemberRegistrationForm from '~/models/MemberRegistrationForm'
import DynamoDB from '~/aws/DynamoDB'
import Environment from '~/Environment'

const { MEMBERS_TABLE_NAME } = Environment

export default class MemberRegistrationService {

  public async register(form: MemberRegistrationForm): Promise<MemberRegistrationForm> {

    await DynamoDB.put({
      TableName: MEMBERS_TABLE_NAME,
      Item: { ...form, rank: 'PENDING' }
    }).promise()

    return form
  }
}
