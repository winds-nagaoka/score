import path from "path"
import NeDB from "nedb"

import { lib } from "./lib"

const authDB = new NeDB({
  filename: path.join(__dirname, 'database/auth.db'),
  autoload: true,
  timestampData: true
})

// ユーザー情報をアップデートする
// in: user[object](たぶん)
// out: callback(err)
function updateUser (user, callback) {
  authDB.update({userid: user.userid}, user, {}, (err, n) => {
    if (err) return callback(err)
    callback(null)
  })
}

// ユーザー情報を取得する
// in: userid
// out: callback(user[object])
function getUser (userid, callback) {
  authDB.findOne({userid}, (err, user) => {
    if (err || user === null) return callback(null)
    callback(user)
  })
}

// ユーザーを新規追加する
// in: userid, passwd
// out: callback(token, userkey)
function addUser (userid, passwd, callback) {
  const hash = lib.getHash(passwd)
  const token = lib.getAuthToken(userid)
  const regTime = (new Date()).getTime()
  const lastLoginTime = regTime
  const name = userid
  const reg = {userid, hash, token, regTime, lastLoginTime, name}
  authDB.insert(reg, (err, newdoc) => {
    if (err) return callback(null)
    callback(token)
  })
}

// ユーザーを削除する
// in: userid, passwd
// out: callback(token, userkey)
function deleteUser (userid, passwd, callback) {
  const hash = lib.getHash(passwd)
  getUser(userid, (user) => {
    if (!user || user.hash !== hash) return callback(null)
    authDB.remove({userid}, {}, (err, numRemoved) => {
      if (err) return callback(null)
      callback(numRemoved)
    })
  })
}

// ログイン処理
// in: userid, passwd
// out: callback(err, token)
function login (userid, passwd, callback) {
  const hash = lib.getHash(passwd)
  const token = lib.getAuthToken(userid)
  const lastLoginTime = (new Date()).getTime()
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
function checkToken (userid, token, callback) {
  getUser(userid, (user) => {
    if (!user || user.token !== token) return callback(true, null)
    callback(null, user)
  })
}

function changeName (userid, name, callback) {
  console.log('[listDB] changeDBName')
  authDB.update({userid}, {$set: {name}}, {}, (err, newdoc) => {
    if (err) return callback(err)
    return callback(null)
  })
}

function changeMail (userid, email, callback) {
  console.log('[listDB] changeDBName')
  authDB.update({userid}, {$set: {email}}, {}, (err, newdoc) => {
    if (err) return callback(err)
    return callback(null)
  })
}

function checkPass (userid, oldPass, newPass, callback) {
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

function changeAdmin (userid, request, callback) {
  getUser(userid, (user) => {
    if (!user) return callback(null)
    user.admin = request
    updateUser(user, (err) => {
      if (err) return callback(null)
      callback(true)
    })
  })
}

module.exports = {
  getUser, addUser, deleteUser, login, checkToken, changeName, changeMail, checkPass, changeAdmin
}