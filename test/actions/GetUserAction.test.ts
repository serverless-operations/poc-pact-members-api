import { Request } from 'lambda-api'
import GetUserAction from '~/actions/GetUserAction'

describe('GetUserAction tests', () => {

  test('Normal case', () => {
    const action = new GetUserAction()
    const actual = action.handle({} as Request)

    const expected = {
      userId: 'dummy_user_id_1',
      username: 'Dummy User'
    }
    expect(actual).toEqual(expected)
  })

})
