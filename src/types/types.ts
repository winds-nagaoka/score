export type Client = {
  agent: string
  id: string
  token: string
  lastLogin: number
}

export type User = {
  name: string
  userid: string
  hash: string
  email: string | null
  emailHash?: string
  emailValid: boolean
  emailValidKey: string | null
  emailValidExpire: number | null
  clientList: Client[]
  regTime: number

  token: string
  lastLoginTime: number
  admin: boolean
}

export type Session = {
  userid: string
  clientid: string
  clientToken: string
  useragent: string
  version: string
}

export type Score = {
  status: boolean | string
  number: string
  titleJa: string
  titleEn: string
  composer: string[] | string
  arranger: string[] | string
  publisher: string
  genre: string
  scoreType: string
  copyMemo: string
  scoreStatus: string
  scoreLack: string
  lackList: string[] | string
  lendLocate: string
  scoreBased: string
  label: string
  boxLabel: string
}

export type Box = {
  status: boolean
  number: number
  label: string
  locate: string | boolean
  time: number | boolean
  _id?: string
}
