import path from 'path'
import NeDB from 'nedb'

import { lib } from './lib'
import type { User } from '../types/types'

const authDB = new NeDB({
  filename: path.join(__dirname, '../../database/auth.db'),
  autoload: true,
  timestampData: true,
})

// ユーザー情報をアップデートする
// in: user[object](たぶん)
// out: callback(err)
function updateUser(user: User, callback: (err: Error | null) => void) {
  authDB.update({ userid: user.userid }, user, {}, (err, n) => {
    if (err) return callback(err)
    callback(null)
  })
}

// ユーザー情報を取得する
// in: userid
// out: callback(user[object])
function getUser(userid: string, callback: (user: User | null) => void) {
  authDB.findOne({ userid }, (err, user) => {
    if (err || user === null) return callback(null)
    callback(user)
  })
}

// ユーザーを新規追加する
// in: userid, passwd
// out: callback(token, userkey)
function addUser(userid: string, passwd: string, callback: (token: string | null) => void) {
  const hash = lib.getHash(passwd)
  const token = lib.getAuthToken(userid)
  const regTime = new Date().getTime()
  const lastLoginTime = regTime
  const name = userid
  const reg = { userid, hash, token, regTime, lastLoginTime, name }
  authDB.insert(reg, (err, newdoc) => {
    if (err) return callback(null)
    callback(token)
  })
}

// ユーザーを削除する
// in: userid, passwd
// out: callback(token, userkey)
function deleteUser(userid: string, passwd: string, callback: (num: number | null) => void) {
  const hash = lib.getHash(passwd)
  getUser(userid, (user) => {
    if (!user || user.hash !== hash) return callback(null)
    authDB.remove({ userid }, {}, (err, numRemoved) => {
      if (err) return callback(null)
      callback(numRemoved)
    })
  })
}

// ログイン処理
// in: userid, passwd
// out: callback(err, token)
function login(userid: string, passwd: string, callback: (err: Error | true | null, token: string | null) => void) {
  const hash = lib.getHash(passwd)
  const token = lib.getAuthToken(userid)
  const lastLoginTime = new Date().getTime()
  getUser(userid, (user) => {
    if (!user || user.hash !== hash) return callback(true, null)
    user.token = token
    user.lastLoginTime = lastLoginTime
    updateUser(user, (err) => {
      if (err) return callback(err, null)
      callback(null, token)
    })
  })
}

// in: userid, token
// out: callback(err, user[object])
function checkToken(userid: string, token: string, callback: (err: true | null, user: User | null) => void) {
  getUser(userid, (user) => {
    if (!user || user.token !== token) return callback(true, null)
    callback(null, user)
  })
}

function changeName(userid: string, name: string, callback: (err: Error | null) => void) {
  console.log('[listDB] changeDBName')
  authDB.update({ userid }, { $set: { name } }, {}, (err, newdoc) => {
    if (err) return callback(err)
    return callback(null)
  })
}

function changeMail(userid: string, email: string, callback: (err: Error | null) => void) {
  console.log('[listDB] changeDBName')
  authDB.update({ userid }, { $set: { email } }, {}, (err, newdoc) => {
    if (err) return callback(err)
    return callback(null)
  })
}

function checkPass(userid: string, oldPass: string, newPass: string, callback: (result: true | null) => void) {
  const oldHash = lib.getHash(oldPass)
  const newHash = lib.getHash(newPass)
  getUser(userid, (user) => {
    if (!user || user.hash !== oldHash) return callback(null)
    user.hash = newHash
    updateUser(user, (err) => {
      if (err) return callback(null)
      callback(true)
    })
  })
}

function changeAdmin(userid: string, request: boolean, callback: (result: true | null) => void) {
  getUser(userid, (user) => {
    if (!user) return callback(null)
    user.admin = request
    updateUser(user, (err) => {
      if (err) return callback(null)
      callback(true)
    })
  })
}

export const auth = {
  getUser,
  addUser,
  deleteUser,
  login,
  checkToken,
  changeName,
  changeMail,
  checkPass,
  changeAdmin,
}
