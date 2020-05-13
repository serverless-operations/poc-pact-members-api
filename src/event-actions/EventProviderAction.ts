/* eslint-disable @typescript-eslint/no-explicit-any */
export default interface EventProviderAction {
  createEvent: (...params: any) => any
  publishEvent: (event: any) => any
}
