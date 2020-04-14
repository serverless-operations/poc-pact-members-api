import { APIGatewayEvent, Context } from 'aws-lambda'
import API from 'lambda-api'
import pkg from '../package.json'

import ErrorHandlers from '~/errors/ErrorHandlers'

import PostRegistrationAction from '~/actions/PostRegistrationAction'

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
  req => new PostRegistrationAction().handle(req))

exports.handler = async (event: APIGatewayEvent, context: Context): Promise<void> => {
  return await api.run(event, context).catch((err: Error) => console.log('Thrown error during invocation: ', err))
}
