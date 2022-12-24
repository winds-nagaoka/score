import express from "express"
const app = express()

import fs from "fs"
import path from "path"

app.use(express.urlencoded({extended: true}))

// ライブラリの読み込み
const auth = require('./server/auth')
const score = require('./server/score')
const box = require('./server/box')
const mail = require('./server/mail')
const lib = require('./server/lib')

// HTTPを使用する(公開用)
import http from "http"
app.listen(3000)

const compression = require('compression')
app.use(compression({
  threshold: 0,
  level: 9,
  memLevel: 9
}))

// CORSを許可する(memberアプリ用)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

// api設定
app.post('/api/adduser', (req, res) => {
  const userid = req.body.userid
  const passwd = req.body.passwd
  const key = req.body.key
  console.log('[' + lib.showTime() + '] api/adduser: ' + userid + ', (passwd), ' + key)
  // パラメータ確認
  if (userid === '' || passwd === '') return res.json({status: false})
  if (lib.getHash(key) !== '0002a3739bc2f722677cb2d9c00450c5b3da7b5972846fef1db51963ba84229eef66baca5251931ce876cc92bda7eb7628a7eed7277d3208d06d13f5ed2acaeb') return res.json({status: false})
  console.log('[api] adduser: ' + key + ': OK')
  // 既存ユーザーの確認
  auth.getUser(userid, (user) => {
    if (user) return res.json({status: false})
    // 新規登録
    auth.addUser(userid, passwd, (token) => {
      if (!token) return res.json({status: false})
      return res.json({status: true, token})
    })
  })
})

app.post('/api/login', (req, res) => {
  const userid = req.body.userid
  const passwd = req.body.passwd
  console.log('[' + lib.showTime() + '] api/login: ' + userid + ', (passwd)')
  auth.login(userid, passwd, (err, token) => {
    if (err) return res.json({status: false})
    console.log('[' + lib.showTime() + '] api/login => (auth.login) OK: done')
    res.json({status: true, token})
  })
})

app.post('/api/auth', (req, res) => {
  const userid = req.body.userid
  const token = req.body.token
  const version = req.body.version
  if (!req.body.version) {
    console.log('[' + lib.showTime() + '] api/auth: ' + userid + ', version: null')
  } else {
    console.log('[' + lib.showTime() + '] api/auth: ' + userid + ', version: ' + version)
  }
  auth.checkToken(userid, token, (err, user) => {
    if (err) {
      console.log('[' + lib.showTime() + '] api/auth => (auth.checkToken) NG')
      return res.json({status: false})
    }
    console.log('[' + lib.showTime() + '] api/auth => (auth.checkToken) OK')
    res.json({status: true, token, user})
  })
})

const request = require('superagent')

function authAPI (send, callback) {
  request.post('https://auth.winds-n.com/auth').type('form').send(send)
  .end((error, response) => {
    if (error) return callback(false)
    if (response.body.status) {
      return callback(response.body.user)
    }
  })
}

app.post('/api/score', (req, res) => {
  const userid = req.body.userid
  const token = req.body.token
  const query = req.body.query
  // ログ出力の場所を変更
  // console.log('[' + lib.showTime() + '] api/score: ' + userid + ', ' + query)
  auth.checkToken(userid, token, (err, user) => {
    if (err) return res.json({status: false})
    score.loadScore(query, (docs) => {
      if (!docs) return res.json({status: true, list: []})
      if (query === '') {
        console.log('[' + lib.showTime() + '] api/score: ' + userid + ', [all], ' + docs.length)
      } else {
        console.log('[' + lib.showTime() + '] api/score: ' + userid + ', ' + query + ', ' + docs.length)
      }
      return res.json({status: true, list: docs})
    })
  })
})

app.post('/api/member/score', (req, res) => {
  const session = req.body.session
  const query = req.body.query
  // if ('member' in req.body) {
    authAPI({session}, (authResult) => {
      if (authResult) {
        score.loadScore(query, (docs) => {
          if (!docs) return res.json({status: true, list: []})
          if (query === '') {
            console.log('(member)[' + lib.showTime() + '] api/score: ' + session.userid + ', version: ' + session.version + ', [all], ' + docs.length)
          } else {
            console.log('(member)[' + lib.showTime() + '] api/score: ' + session.userid + ', version: ' + session.version + ', ' + query + ', ' + docs.length)
          }
          return res.json({status: true, list: docs})
        })
      }
    })
  // }
})

app.post('/api/count', (req, res) => {
  const userid = req.body.userid
  const token = req.body.token
  // ログ出力の場所を変更
  // console.log('[' + lib.showTime() + '] api/score: ' + userid + ', ' + query)
  auth.checkToken(userid, token, (err, user) => {
    if (err) return res.json({status: false})
    score.loadScore('', (docs) => {
      if (!docs) return res.json({status: true, list: []})
      console.log('[' + lib.showTime() + '] api/count: ' + userid + ', [all], ' + docs.length)
      return res.json({status: true, count: docs.length})
    })
  })
})

app.post('/api/member/count', (req, res) => {
  const session = req.body.session
  // if ('member' in req.body) {
    authAPI({session}, (authResult) => {
      if (authResult) {
        score.loadScore('', (docs) => {
          if (!docs) return res.json({status: true, list: []})
          console.log('(member)[' + lib.showTime() + '] api/count: ' + session.userid + ', version: ' + session.version + ', [all], ' + docs.length)
          return res.json({status: true, count: docs.length})
        })
      }
    })
  // }
})

app.post('/api/edit', (req, res) => {
  const userid = req.body.userid
  const token = req.body.token
  const id = req.body.id
  const mode = req.body.mode
  const data = fixComposerArranger(req.body.data)
  // ログ出力の場所を変更
  // console.log('[' + lib.showTime() + '] api/edit: ' + userid)
  auth.checkToken(userid, token, (err, user) => {
    if (err) return res.json({status: false})
    if (mode === 'new') {
      // 新規作成
      console.log('[' + lib.showTime() + '] api/edit: addScore')
      score.checkData(data.number, (err, docs) => {
        // 重複チェック
        if (docs) return res.json({status: false})
        score.addScore(data, (err) => {
          if (err) return res.json({status: false})
          res.json({status: true})
        })
      })
    } else {
      // 編集
      console.log('[' + lib.showTime() + '] api/edit: editScore')
      score.modifyScore(id, data, (err) => {
        if (err) return res.json({status: false})
        res.json({status: true})
      })
    }
  })
})

app.post('/api/member/edit', (req, res) => {
  const session = req.body.session
  const id = req.body.id
  const mode = req.body.mode
  // console.log('************************************')
  // console.log(JSON.stringify(req.body.data,null,'  '))
  // console.log('************************************')
  const data = fixComposerArranger(req.body.data)
  // console.log('++++++++++++++++++++++++++++++++++++')
  // console.log(JSON.stringify(data,null,'  '))
  // console.log('++++++++++++++++++++++++++++++++++++')
  // if ('member' in req.body) {
    authAPI({session}, (authResult) => {
      if (authResult) {
        if (mode === 'new') {
          // 新規作成
          console.log('(member)[' + lib.showTime() + '] api/edit: addScore, version: ' + session.version)
          score.checkData(data.number, (err, docs) => {
            // 重複チェック
            if (docs) return res.json({status: false})
            score.addScore(data, (err) => {
              if (err) return res.json({status: false})
              res.json({status: true})
            })
          })
        } else {
          // 編集
          console.log('(member)[' + lib.showTime() + '] api/edit: editScore, version: ' + session.version)
          score.modifyScore(id, data, (err) => {
            if (err) return res.json({status: false})
            res.json({status: true})
          })
        }
      }
    })
  // }
})

app.post('/api/detail', (req, res) => {
  const userid = req.body.userid
  const token = req.body.token
  const id = req.body.id
  console.log('[' + lib.showTime() + '] api/detail: ' + userid + ', ' + id)
  if (!id) return res.json({status: false})
  auth.checkToken(userid, token, (err, user) => {
    if (err) return res.json({status: false})
    score.loadData(id, (data) => {
      if (!data) return res.json({status: false})
      // 箱の情報を取得
      box.loadBox((box) => {
        if (!box) return res.json({status: true, data, boxList: []})
        return res.json({status: true, data, boxList: box})
      })
    })
  })
})

app.post('/api/member/detail', (req, res) => {
  const session = req.body.session
  const id = req.body.id
  console.log('(member)[' + lib.showTime() + '] api/detail: ' + session.userid + ', ' + id + ', version: ' + session.version)
  // if ('member' in req.body) {
    authAPI({session}, (authResult) => {
      if (authResult) {
        score.loadData(id, (data) => {
          if (!data) return res.json({status: false})
          // 箱の情報を取得
          box.loadBox((box) => {
            if (!box) return res.json({status: true, data, boxList: []})
            return res.json({status: true, data, boxList: box})
          })
        })
      }
    })
  // }
})

function fixComposerArranger (data) {
  if (Array.isArray(data.composer)) {
    const composerCount = data.composer.length
    let blank = []
    for (let i=0;i<composerCount;i++) {
      if (data.composer[i].trim() === '') blank.push(i)
    }
    blank.reverse().map((j) => data.composer.splice(j,1))
    if (data.composer.length === 0) data.composer = ['']
  } else {
    data.composer = [data.composer.trim()]
  }
  if (Array.isArray(data.arranger)) {
    const arrangerCount = data.arranger.length
    let blank = []
    for (let i=0;i<arrangerCount;i++) {
      if (data.arranger[i].trim() === '') blank.push(i)
    }
    blank.reverse().map((j) => data.arranger.splice(j,1))
    if (data.arranger.length === 0) data.arranger = ['']
  } else {
    data.arranger = [data.arranger.trim()]
  }
  if (Array.isArray(data.lackList)) {
    const lackListCount = data.lackList.length
    let blank = []
    for (let i=0;i<lackListCount;i++) {
      if (data.lackList[i].trim() === '') blank.push(i)
    }
    blank.reverse().map((j) => data.lackList.splice(j,1))
    if (data.lackList.length === 0) data.lackList = ['']
  } else {
    data.lackList = [data.lackList.trim()]
  }
  return data
}

app.post('/api/input', (req, res) => {
  const userid = req.body.userid
  const token = req.body.token
  const target = req.body.target
  const query = req.body.query
  console.log('[' + lib.showTime() + '] api/input: ' + userid + ', ' + target + ', ' + query)
  auth.checkToken(userid, token, (err, user) => {
    if (err) return res.json({status: false})
    score.searchInput(target, query, (docs) => {
      if (!docs) return res.json({status: true, list: []})
      res.json({status: true, list: docs})
    })
  })
})

app.post('/api/member/input', (req, res) => {
  const session = req.body.session
  const target = req.body.target
  const query = req.body.query
  console.log('(member)[' + lib.showTime() + '] api/input: ' + session.userid + ', version: ' + session.version)
  // if ('member' in req.body) {
    authAPI({session}, (authResult) => {
      if (authResult) {
        score.searchInput(target, query, (docs) => {
          if (!docs) return res.json({status: true, list: []})
          res.json({status: true, list: docs})
        })
      }
    })
  // }
})

app.post('/api/delete', (req, res) => {
  const userid = req.body.userid
  const token = req.body.token
  const id = req.body.id
  console.log('[' + lib.showTime() + '] api/delete: ' + userid + ', ' + id)
  auth.checkToken(userid, token, (err, user) => {
    if (err) return res.json({status: false})
    score.deleteScore(id, (result) => {
      if (!result) return res.json({status: false})
      res.json({status: true})
    })
  })
})

app.post('/api/box', (req, res) => {
  const userid = req.body.userid
  const token = req.body.token
  console.log('[' + lib.showTime() + '] api/box: ' + userid)
  auth.checkToken(userid, token, (err, user) => {
    if (err) return res.json({status: false})
    box.loadBox((docs) => {
      if (!docs) return res.json({status: true, list: []})
      return res.json({status: true, list: docs})
    })
  })
})

app.post('/api/member/box', (req, res) => {
  const session = req.body.session
  console.log('(member)[' + lib.showTime() + '] api/box: ' + session.userid + ', version: ' + session.version)
  // if ('member' in req.body) {
    authAPI({session}, (authResult) => {
      if (authResult) {
        box.loadBox((docs) => {
          if (!docs) return res.json({status: true, list: []})
          return res.json({status: true, list: docs})
        })
      }
    })
  // }
})

// 新しい楽譜追加用
app.post('/api/edit/pre', (req, res) => {
  const userid = req.body.userid
  const token = req.body.token
  const id = req.body.id
  const mode = req.body.mode
  // ログ出力の場所を変更
  // console.log('[' + lib.showTime() + '] api/edit/pre: ' + userid)
  auth.checkToken(userid, token, (err, user) => {
    if (err) return res.json({status: false})
    box.loadBox((box) => {
      // if (!id) {
      if (mode === 'new') {
        // 新規作成
        console.log('[' + lib.showTime() + '] api/edit/pre: addNewScore')
        score.loadLatest((latest) => {
          if (!latest) return res.json({status: true, boxList: []})
          if (!box) return res.json({status: true, latest, boxList: []})
          // console.log(latest)
          return res.json({status: true, latest: latest[0], boxList: box})
        })
      } else {
        // 編集
        console.log('[' + lib.showTime() + '] api/edit/pre: addEditScore')
        score.loadData(id, (data) => {
          if (!data) return res.json({status: false})
          if (!box) return res.json({status: true, data, boxList: []})
          return res.json({status: true, data, boxList: box})
        })
      }
    })
  })
})

app.post('/api/member/edit/pre', (req, res) => {
  const session = req.body.session
  const id = req.body.id
  const mode = req.body.mode
  // if ('member' in req.body) {
    authAPI({session}, (authResult) => {
      if (authResult) {
        box.loadBox((box) => {
          // if (!id) {
          if (mode === 'new') {
            // 新規作成
            console.log('(member)[' + lib.showTime() + '] api/edit/pre: addNewScore, version: ' + session.version)
            score.loadLatest((latest) => {
              if (!latest) return res.json({status: true, boxList: []})
              if (!box) return res.json({status: true, latest, boxList: []})
              // console.log(latest)
              return res.json({status: true, latest: latest[0], boxList: box})
            })
          } else {
            // 編集
            console.log('(member)[' + lib.showTime() + '] api/edit/pre: addEditScore, version: ' + session.version)
            score.loadData(id, (data) => {
              if (!data) return res.json({status: false})
              if (!box) return res.json({status: true, data, boxList: []})
              return res.json({status: true, data, boxList: box})
            })
          }
        })
      }
    })
  // }
})

// 箱の管理
app.post('/api/box/add', (req, res) => {
  const userid = req.body.userid
  const token = req.body.token
  console.log('[' + lib.showTime() + '] api/box/add: ' + userid)
  auth.checkToken(userid, token, (err, user) => {
    if (err) return res.json({status: false})
    box.addBox((err, label) => {
      if (err) return res.json({status: false})
      res.json({status: true, label: label})
    })
  })
})

app.post('/api/member/box/add', (req, res) => {
  const session = req.body.session
  console.log('(member)[' + lib.showTime() + '] api/box/add: ' + session.userid + ', version: ' + session.version)
  // if ('member' in req.body) {
    authAPI({session}, (authResult) => {
      if (authResult) {
        box.addBox((err, label) => {
          if (err) return res.json({status: false})
          res.json({status: true, label})
        })
      }
    })
  // }
})

app.post('/api/box/modify', (req, res) => {
  const userid = req.body.userid
  const token = req.body.token
  const id = req.body.id
  const locate = req.body.locate
  console.log('[' + lib.showTime() + '] api/box/modify: ' + userid)
  auth.checkToken(userid, token, (err, user) => {
    if (err) return res.json({status: false})
    box.modifyBox(id, locate, (err) => {
      if (err) return res.json({status: false})
      res.json({status: true})
    })
  })
})

app.post('/api/member/box/modify', (req, res) => {
  const session = req.body.session
  const id = req.body.id
  const locate = req.body.locate
  console.log('(member)[' + lib.showTime() + '] api/box/modify: ' + session.userid + ', version: ' + session.version)
  // if ('member' in req.body) {
    authAPI({session}, (authResult) => {
      if (authResult) {
        box.modifyBox(id, locate, (err) => {
          if (err) return res.json({status: false})
          res.json({status: true})
        })
      }
    })
  // }
})

app.post('/api/box/delete', (req, res) => {
  const userid = req.body.userid
  const token = req.body.token
  const id = req.body.id
  console.log('[' + lib.showTime() + '] api/box/delete: ' + userid)
  auth.checkToken(userid, token, (err, user) => {
    if (err) return res.json({status: false})
    box.deleteBox(id, (err) => {
      if (err) return res.json({status: false})
      res.json({status: true})
    })
  })
})

app.post('/api/member/box/delete', (req, res) => {
  const session = req.body.session
  const id = req.body.id
  console.log('(member)[' + lib.showTime() + '] api/box/delete: ' + session.userid + ', version: ' + session.version)
  // if ('member' in req.body) {
    authAPI({session}, (authResult) => {
      if (authResult) {
        box.deleteBox(id, (err) => {
          if (err) return res.json({status: false})
          res.json({status: true})
        })
      }
    })
  // }
})

app.post('/api/status', (req, res) => {
  const userid = req.body.userid
  const token = req.body.token
  console.log('[' + lib.showTime() + '] api/status: ' + userid)
  auth.checkToken(userid, token, (err, user) => {
    if (err) return res.json({status: false})
    auth.getUser(userid, (user) => {
      if (!user) return res.json({status: false})
      return res.json({status: true, user})
    })
  })
})

app.post('/api/setting/username', (req, res) => {
  const userid = req.body.userid
  const token = req.body.token
  const text = req.body.text
  console.log('[' + lib.showTime() + '] api/setting/username: ' + userid + ', ' + text)
  auth.checkToken(userid, token, (err, user) => {
    if (err) return res.json({status: false})
    auth.changeName(user.userid, text, (err) => {
      if (err) return res.json({status: false})
      res.json({status: true})
    })
  })
})

app.post('/api/setting/email', (req, res) => {
  const userid = req.body.userid
  const token = req.body.token
  const text = req.body.text
  console.log('[' + lib.showTime() + '] api/setting/email: ' + userid + ', ' + text)
  if(!text.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)) {
    console.log('[' + lib.showTime() + '] api/setting/email: Not match email address')
    return res.json({status: false})
  }
  auth.checkToken(userid, token, (err, user) => {
    if (err) return res.json({status: false})
    auth.changeMail(user.userid, text, (err) => {
      if (err) return res.json({status: false})
      res.json({status: true})
    })
  })
})

app.post('/api/setting/password', (req, res) => {
  const userid = req.body.userid
  const token = req.body.token
  const newPass = req.body.new
  const oldPass = req.body.old
  console.log('[' + lib.showTime() + '] api/setting/password: ' + userid + ', (hash)')
  auth.checkToken(userid, token, (err, user) => {
    if (err) return res.json({status: false})
    auth.checkPass(userid, oldPass, newPass, (result) => {
      if (!result) return res.json({status: false})
      res.json({status: true})
    })
  })
})

app.post('/api/setting/delete', (req, res) => {
  const userid = req.body.userid
  const token = req.body.token
  const pass = req.body.pass
  // ログ出力の場所を変更
  // console.log('[' + lib.showTime() + '] api/score: ' + userid + ', ' + query)
  auth.checkToken(userid, token, (err, user) => {
    if (err) return res.json({status: false})
    auth.deleteUser(userid, pass, (result) => {
      if (!result) return res.json({status: false})
      res.json({status: true})
    })
  })
})

app.post('/api/setting/admin', (req, res) => {
  const userid = req.body.userid
  const token = req.body.token
  const request = req.body.request
  console.log('[' + lib.showTime() + '] api/setting/admin: ' + userid + ', ' + request)
  auth.checkToken(userid, token, (err, user) => {
    if (err) return res.json({status: false})
    auth.changeAdmin(userid, request, (result) => {
      if (!result) return res.json({status: false})
      res.json({status: true})
    })
  })
})

app.post('/api/sendmail', (req, res) => {
  const userid = req.body.userid
  const token = req.body.token
  const to = req.body.to
  const name = req.body.name
  const subject = req.body.subject
  const body = req.body.body
  console.log('[' + lib.showTime() + '] api/sendmail: ' + userid)
  auth.checkToken(userid, token, (err, user) => {
    if (err) return res.json({status: false})
    score.loadScoreAll((docs) => {
      if (!docs) return res.json({status: false})
      const list = mail.listData(docs)
      mail.sendEmail(to, name, subject, body, list, (result) => {
        console.log('[' + lib.showTime() + '] api/sendmail: complete')
        res.json({status: true})
      })
    })
  })
})

app.post('/api/member/sendmail', (req, res) => {
  const session = req.body.session
  console.log('(member)[' + lib.showTime() + '] api/sendmail: ' + session.userid + ', version: ' + session.version)
  authAPI({session}, (user) => {
    if (user) {
      if (!user.email || !user.emailValid) return res.json({status: false})
      score.loadScoreAll((docs) => {
        if (!docs) return res.json({status: false})
        const list = mail.listData(docs)
        mail.sendEmailDovecot(user, list, (result) => {
          console.log('[' + lib.showTime() + '] api/sendmail: ', result ? 'complete' : 'error')
          if (!result) return res.json({status: false})
          return res.json({status: true})
        })
      })
    } else {
      res.json({status: false})
    }
  })
})
