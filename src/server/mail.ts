import fetch from "node-fetch"

const mailConfig = require('../../../secrets/mail')

function listData (docs) {
  var list = ''
  const title = '"status", "number", "score label", "box label", '
              + '"title ja", "title en", "composer", "arranger", "genre", '
              + '"publisher", "score type", "copy memo", "score lack", "lack list", '
              + '"score status", "lend locate", "score based"' + "\r\n"
  for (var i = 0;i < docs.length; i++) {
    var each = docs[i]
    var score = status(each.status) + ', ' + env(each.number) + ', ' + env(each.label) + ', ' + env(each.boxLabel) + ', '
              + env(each.titleJa) + ', ' + env(each.titleEn) + ', ' + env(listing(each.composer)) + ', ' + env(listing(each.arranger)) + ', ' + env(each.genre) + ', '
              + env(each.publisher) + ', ' + scoreType(each.scoreType) + ', ' + env(each.copyMemo) + ', ' + scoreLack(each.scoreLack) + ', ' + env(listing(each.lackList)) + ', '
              + scoreStatus(each.scoreStatus) + ', ' + env(each.lendLocate) + ', ' + scoreBased(each.scoreBased) + "\r\n"
    list += score
  }
  return (title + list)
}

function env (s) {
  return '"' + s + '"'
}

function listing (s) {
  var list = ''
  for (var i = 0; i < s.length; i++) {
    if (s[i] !== '') {
      list += s[i] + ', '
    }
  }
  // console.log(list)
  result = list.slice(0, -2)
  // console.log(result)
  return result
}

function status (s) {
  if (s === 'true') {
    return 'OK'
  } else {
    return '削除'
  }
}

function scoreType (s) {
  if (s === '1') {
    return 'コピー譜'
  } else {
    return '原譜'
  }
}

function scoreLack (s) {
  if (s === '2') {
    return '未確認'
  } else if (s === '1') {
    return 'あり'
  } else {
    return 'なし'
  }
}

function scoreStatus (s) {
  if (s === '2') {
    return '貸出中'
  } else if (s === '1') {
    return '使用中'
  } else {
    return '保管'
  }
}

function scoreBased (s) {
  if (s === '1') {
    return '未処理'
  } else {
    return '完了'
  }
}

function sendEmail (to, name, subject, body, attach, callback) {
  fetch(mailConfig.requestMailPath, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({sendpass: mailConfig.sendPass, to, name, subject, body, attach})
  }).then(res => callback(res))
}

import nodeMailer from "nodemailer"

const mailSetting = {
  host: 'mail.winds-n.com',
  auth: {
    user: 'noreply@winds-n.com',
    pass: mailConfig.dovecotPass.noreply,
    port: '465'
  },
  tls: {rejectUnauthorized: false},
  debug:true
}

const smtp = nodeMailer.createTransport(mailSetting)

import { lib } from "./lib"

function sendEmailDovecot (user, list, callback) {
  console.log('[' + lib.showTime() + '] sendUpdateEmail to: ', user.email)
  const mailText =
  user.name + ' 様\r\n' +
  '\r\n' +
  '平素よりウィンズアプリのご利用ありがとうございます。\r\n' +
  'ウィンズが保管している楽譜データを添付します。\r\n' +
  '\r\n' +
  'ファイルはCSV形式です。\r\n' +
  '文字化けする場合は一度Googleスプレッドシードなどで開き、上書き保存してからご利用ください。\r\n' +
  'このメールに心当たりのない場合は、お手数ですが下記までご連絡ください。\r\n' +
  '\r\n' +
  '--\r\n' +
  '\r\n' +
  'ザ・ウィンド・アンサンブル\r\n' +
  'https://winds-n.com'
  const mailContents = {
    from: 'ザ・ウィンド・アンサンブル <noreply@winds-n.com>',
    to: user.email,
    subject: 'ウィンズの楽譜データ',
    // html: '',
    text: mailText,
    attachments: [
      {
        filename: 'score.csv',
        content: list,
        // contentType: 'text/csv'
      }
    ]
  }
  smtp.sendMail(mailContents, (err, result) => {
    err ? console.log('NG', err) : console.log('OK', result)
    if (err) return callback(false)
    return callback(true)
  })
}

export const mail = {
  listData, sendEmail, sendEmailDovecot
}