export default interface Member {
  userId: string
  nickname: string
  gender: string
  ageGroup: string
  rank: 'PENDING' | 'SILVER' | 'GOLD'
  tosAgreed: boolean
}
