const path = require('path')
const NeDB = require('nedb')

const lib = require('./lib')
// const auth = require('./auth')
// const del = require('./delete')

const del = require('./delete')

const scoreDB = new NeDB({
  filename: path.join(__dirname, 'database/score.db'),
  autoload: true,
  timestampData: true
})

function loadScore (query, callback) {
  if (query === '') {
    scoreDB.find({status: 'true'}).sort({titleJa: 1}).exec((err, docs) => {
      return callback(docs)
    })
  } else if (query.match(/^box[-:]\s?/i)) {
    // console.log('箱の検索',query.replace(/^box[-:]\s?/ig, ''))
    if (!query.replace(/^box[-:]\s?/ig, '')) return callback(null)
    scoreDB.find({status: 'true', boxLabel: new RegExp(lib.escapeReg(query.replace(/^box[-:]\s?/ig, '')), 'i')}).sort({label: 1}).exec((err, docs) => {
      if (err) return callback(null)
      return callback(docs)
    })
  } else if (query.match(/^(保管|貸出|使用)中?/g)) {
    let request
    if (query.match(/貸出中?/g)) {
      request = 2
    } else if (query.match(/使用中?/g)) {
      request = 1
    } else {
      request = 0
    }
    console.log('状態の検索', query, request)
    scoreDB.find({status: 'true', scoreStatus: String(request)}).sort({label: 1}).exec((err, docs) => {
      if (err) return callback(null)
      return callback(docs)
    })
  } else {
    const s = new RegExp(lib.escapeReg(query), 'i')
    // console.log('正規表現', s)
    const searchQuery = [
      {titleEn: s},
      {titleJa: s},
      {subtitle: s},
      {composer: s},
      {arranger: s},
      {label: s}
    ]
    // listDB.find({ $or: [{titleEn: s}, {titleJa: s}, {subtitle: s}, {composer: s}, {arranger: s}]}, (err, docs) => {
    scoreDB.find({status: 'true', $or: searchQuery}).sort({titleEn: 1}).exec((err, docs) => {
      if (err) return callback(null)
      return callback(docs)
    })
  }
}

function loadScoreAll (callback) {
  scoreDB.find({status: 'true'}).sort({createdAt: 1}).exec((err, docs) => {
    return callback(docs)
  })
}

function loadData (id, callback) {
  scoreDB.findOne({_id: id}, (err, docs) => {
    if (err) return callback(null)
    delete docs._id
    callback(docs)
  })
}

// 新規登録時に最新の情報を取得
function loadLatest (callback) {
  // scoreDB.find({}).sort({time: -1}).limit(1).exec((err, docs) => {
  scoreDB.find({}).sort({createdAt: -1}).limit(1).exec((err, docs) => {
    if (err) return callback(null)
    // console.log('latest')
    // console.log(docs)
    return callback(docs)
  })
}

// 新規登録時の重複チェック
function checkData (num, callback) {
  scoreDB.findOne({number: num}, (err, docs) => {
    if (err) return callback(err, null)
    if (!docs) return callback(null, null)
    callback(null, docs)
  })
}

function addScore (data, callback) {
  // data.time = String((new Date()).getTime())
  data.status = 'true'
  scoreDB.insert(data, (err, newdoc) => {
    if (err) return callback(err)
    callback(null)
  })
}

function modifyScore (id, data, callback) {
  scoreDB.update({_id: id}, data, {}, (err, n) => {
    if (err) return callback(err)
    callback(null)
  })
}

function searchInput (target, query, callback) {
  if (query === '') return callback(null)
  // console.log(target, query)
  const s = new RegExp(lib.escapeReg(query), 'i')
  var searchQuery = new Object
  searchQuery[target] = s
  // console.log(searchQuery)
  scoreDB.find(searchQuery, (err, docs) => {
    if (err) return callback(null)
    // console.log(docs)
    return callback(docs)
  })
}

function deleteScore (id, callback) {
  loadData(id, (data) => {
    if (!data) return callback(null)
    data.status = false
    scoreDB.update({_id: id}, data, {}, (err, n) => {
      if (err) return callback(null)
      del.addDelete(data, (err) => {
        if (err) return callback(null)
        return callback(true)
      })
    })
  })
}

module.exports = {
  loadScore, loadScoreAll, loadData, loadLatest, checkData, addScore, modifyScore, searchInput, deleteScore
}