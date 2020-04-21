import { Request } from 'lambda-api'
import ValidationError from '~/errors/ValidationError'
import MemberRegistrationService from '~/services/MemberRegistraionService'
import RegistrationForm from '~/models/MemberRegistrationForm'

export type APIRequestBody = {
  userId?: string
  nickname?: string
  gender?: string
  ageGroup?: string
  tosAgreed?: boolean
}

export type APIResponseBody = RegistrationForm

export default class PostRegistrationAction {

  public async handle(req: Request): Promise<APIResponseBody> {

    const validated = this.validate(req.body)

    const service = new MemberRegistrationService()
    const result = await service.register({ ...validated })

    return result
  }

  private validate(body: APIRequestBody) {
    const { userId, nickname, gender, ageGroup, tosAgreed } = body

    if (!userId || !nickname || !gender || !ageGroup) {
      throw new ValidationError('MISSING_REQUIRED_PARAMETER', 'Missing required properties in request body.')
    }

    const validGenderValues = [ 'male', 'female', 'others' ]
    if (!validGenderValues.includes(gender)) {
      throw new ValidationError('INVALID_PARAMETER', 'Invalid gender value.')
    }

    const validAgeGroupValues = [ 'teens', 'twenties', 'thirties', 'fourties', 'fifties', 'sixties or more' ]
    if (!validAgeGroupValues.includes(ageGroup)) {
      throw new ValidationError('INVALID_PARAMETER', 'Invalid ageGroup value.')
    }

    if (!tosAgreed) {
      throw new ValidationError('INVALID_PARAMETER', 'ToS must be agreed.')
    }

    return { userId, nickname, gender, ageGroup, tosAgreed }
  }
}
