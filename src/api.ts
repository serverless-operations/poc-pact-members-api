import { APIGatewayEvent, Context } from 'aws-lambda'
import API from 'lambda-api'
import pkg from '../package.json'

import ErrorHandlers from '~/errors/ErrorHandlers'

import PostRegistrationAction from '~/actions/PostRegistrationAction'
import GetMemberAction from '~/actions/GetMemberAction'
import GetMembersAction from '~/actions/GetMembersAction'
import PostAsyncDownloadMembersAction from './actions/PostAsyncDownloadMembersAction'
import GetAsyncRequestStatusAction from './actions/GetAsyncRequestStatusAction'

const api = API({ version: pkg.version })

api.use(...ErrorHandlers)
api.use((_req, res, next) => {
  // Middleware for global CORS configuration
  res.cors({})
  next()
})

api.get('/version',
  req => ({ version: req.version }))

api.post('/registration',
  async req => await new PostRegistrationAction().handle(req))

api.get('/members',
  async req => await new GetMembersAction().handle(req))

api.get('/members/:user_id',
  async req => await new GetMemberAction().handle(req))

api.post('/async/download_members',
  async req => await new PostAsyncDownloadMembersAction().handle(req))

api.get('/async/status/:request_id',
  async req => await new GetAsyncRequestStatusAction().handle(req))

exports.handler = async (event: APIGatewayEvent, context: Context): Promise<void> => {
  return await api.run(event, context).catch((err: Error) => console.log('Thrown error during invocation: ', err))
}
