import { Request } from 'lambda-api'

interface User {
  userId: string;
  username: string;
}

export default class GetUserAction {

  public handle(_req: Request): User {

    return {
      userId: 'dummy_user_id_1',
      username: 'Dummy User'
    }
  }
}
